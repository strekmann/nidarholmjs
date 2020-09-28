use bson::ordered::OrderedDocument;
use log::{debug, info};
use mongodb::db::ThreadedDatabase;
use mongodb::{doc, Client, ThreadedClient};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::env;
use std::str::FromStr;
use std::sync::Arc;

#[macro_use]
extern crate bson;

/** Member struct, containing address, delivery mode, display name, etc */
#[derive(Clone, Debug, Deserialize)]
struct Member {
    address: String,
    delivery_mode: String,
    email: String,
    list_id: String,
    role: String,
    member_id: u128,
    self_link: String,
    display_name: String,
    user: Option<String>,
    http_etag: String,
}

/** List of members, in `entries` */
#[derive(Debug, Deserialize)]
struct MemberList {
    start: usize,
    total_size: usize,
    #[serde(default = "MemberList::empty_vector")]
    entries: Vec<Member>,
    http_etag: String,
}

/** The relation between a list member and the list */
#[derive(Clone, Debug, Serialize)]
struct Subscription {
    list_id: String,
    subscriber: String,
    role: String,
    pre_verified: bool,
    pre_confirmed: bool,
    pre_approved: bool,
}

#[derive(Clone, Debug, Serialize)]
struct UpdateModeration {
    moderation_action: String,
}

struct Database {
    database: Arc<mongodb::db::DatabaseInner>,
}

impl Database {
    pub fn new(host: &str, port: u16, database: &str) -> Database {
        Database {
            database: Client::connect(host, port)
                .expect("Failed to connect to mongodb")
                .db(&database),
        }
    }

    pub fn get_document_by_key(
        &self,
        collection: &str,
        key: &str,
        value: &str,
    ) -> bson::ordered::OrderedDocument {
        let query = doc! {key => value};
        self.database
            .collection(collection)
            .find_one(Some(query), None)
            .unwrap_or_else(|_| panic!("Could not find {}={} in {}", key, value, collection))
            .unwrap_or_else(|| panic!("Could not get {}={} in {}", key, value, collection))
    }
    pub fn get_organization(&self, name: &str) -> bson::ordered::OrderedDocument {
        self.get_document_by_key("organizations", "_id", name)
    }

    pub fn get_group_by_id(&self, id: &str) -> OrderedDocument {
        self.get_document_by_key("groups", "_id", id)
    }

    pub fn get_group_by_name(&self, name: &str) -> OrderedDocument {
        self.get_document_by_key("groups", "name", name)
    }

    pub fn get_group_cursor(&self) -> mongodb::cursor::Cursor {
        self.database
            .collection("groups")
            .find(None, None)
            .expect("Could not find all groups")
    }

    pub fn get_user_by_id(&self, id: &str) -> OrderedDocument {
        self.get_document_by_key("users", "_id", id)
    }
}

/** Keeps the necessary services and variables */
struct Api {
    client: reqwest::Client,
    base_url: String,
    user: String,
    password: Option<String>,
}

impl MemberList {
    fn empty_vector() -> Vec<Member> {
        let v: Vec<Member> = Vec::new();
        v
    }
}

pub enum ModerationAction {
    Accept,
    Deny,
}

impl ModerationAction {
    pub fn as_str(&self) -> &'static str {
        match self {
            ModerationAction::Accept => "accept",
            ModerationAction::Deny => "deny",
        }
    }
}

impl FromStr for ModerationAction {
    type Err = ();
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "accept" => Ok(ModerationAction::Accept),
            "deny" => Ok(ModerationAction::Deny),
            _ => Err(()),
        }
    }
}

#[derive(Copy, Clone, Debug, Serialize, PartialEq)]
pub enum Role {
    NonMember,
    Member,
    Moderator,
}

impl Role {
    pub fn as_str(&self) -> &'static str {
        match self {
            Role::NonMember => "nonmember",
            Role::Member => "member",
            Role::Moderator => "moderator",
        }
    }
}

impl FromStr for Role {
    type Err = ();
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "nonmember" => Ok(Role::NonMember),
            "member" => Ok(Role::Member),
            "moderator" => Ok(Role::Moderator),
            _ => Err(()),
        }
    }
}

impl Api {
    pub fn new(url: &str, user: &str, password: &str) -> Api {
        Api {
            client: reqwest::Client::new(),
            base_url: url.to_owned(),
            user: user.to_owned(),
            password: Some(password.to_owned()),
        }
    }

    fn get_members(&self, group_email: &str, role: Role) -> HashSet<String> {
        let url = format!(
            "{}/lists/{}/roster/{}",
            self.base_url,
            str::replace(group_email, "@", "."),
            role.as_str(),
        );

        let mut response = self
            .client
            .get(url.as_str())
            .basic_auth(self.user.clone(), self.password.clone())
            .send()
            .unwrap_or_else(|_| {
                panic!(
                    "Error when getting members for {} ({})",
                    &group_email,
                    &role.as_str()
                )
            })
            .error_for_status()
            .unwrap_or_else(|_| panic!("Error when getting members of {}", group_email));

        let json: MemberList = response.json().unwrap_or_else(|err| {
            panic!(
                "{} did not get a valid json object {:#?}: {}",
                url,
                response.text(),
                err
            )
        });

        let mut member_set: HashSet<String> = HashSet::new();
        for member in json.entries {
            match member.user {
                Some(_) => member_set.insert(member.email.clone()),
                None => false, // A nonmember on the list not registered by us (normal case for post etc)
            };
        }
        member_set
    }

    fn subscribe(&self, group_email: &str, group_member: &str, role: Role) {
        let subscription = Subscription {
            list_id: str::replace(group_email, "@", "."),
            subscriber: group_member.to_string(),
            role: role.as_str().to_string(),
            pre_verified: true,
            pre_confirmed: true,
            pre_approved: true,
        };
        info!("{} + {} as {}", group_email, group_member, role.as_str());
        let response = self
            .client
            .post(format!("{}/members", self.base_url).as_str())
            .basic_auth(self.user.to_owned(), self.password.to_owned())
            .form(&subscription)
            .send();

        response
            .expect("Error in adding user")
            .error_for_status()
            .unwrap_or_else(|err| {
                panic!(
                    "Add did not work for {} to {}: {}, ({})",
                    subscription.subscriber,
                    subscription.list_id,
                    subscription.role.as_str(),
                    err
                )
            });
    }

    fn unsubscribe(&self, group_email: &str, emails: Vec<String>, role: Role) {
        let mut email_tuples: Vec<(String, String)> = Vec::new();
        for email in &emails {
            email_tuples.push((String::from("emails"), email.to_owned()));
        }
        let delete_url: String = format!(
            "{}/lists/{}/roster/{}",
            self.base_url,
            str::replace(group_email, "@", "."),
            role.as_str(),
        );
        info!(
            "{} - {} as {}",
            group_email,
            emails.join(", "),
            role.as_str()
        );
        self.client
            .delete(&delete_url)
            .basic_auth(self.user.to_owned(), self.password.to_owned())
            .form(&email_tuples)
            .send()
            .expect("Delete query failed")
            .error_for_status()
            .unwrap_or_else(|_| {
                panic!(
                    "Remove did not work for {:#?} on {}",
                    email_tuples, delete_url
                )
            });
    }
    fn set_moderation_action(&self, action: &str, role: Role, group_email: &str, email: &str) {
        let patch_url: String = format!(
            "{}/lists/{}/{}/{}",
            self.base_url,
            group_email,
            role.as_str(),
            email,
        );
        let moderation_action = action
            .parse::<ModerationAction>()
            .expect("Unknown moderation action");
        let update_moderation = UpdateModeration {
            moderation_action: moderation_action.as_str().to_string(),
        };
        self.client
            .patch(&patch_url)
            .basic_auth(self.user.to_owned(), self.password.to_owned())
            .form(&update_moderation)
            .send()
            .expect("Setting moderation action failed")
            .error_for_status()
            .unwrap_or_else(|_| {
                panic!(
                    "Patching moderation_action {:#?} did not work for {} in {}, {}",
                    moderation_action.as_str(),
                    email,
                    group_email,
                    patch_url,
                )
            });
    }
    fn update_members(&self, group_email: &str, members: HashSet<&str>, role: Role) {
        debug!("Updating {}, {}", group_email, role.as_str());
        let mut member_set = self.get_members(group_email, role);
        for group_member in members {
            if !member_set.contains(group_member) {
                self.subscribe(group_email, group_member, role);
                if role == Role::NonMember {
                    self.set_moderation_action(
                        ModerationAction::Accept.as_str(),
                        role,
                        group_email,
                        group_member,
                    );
                }
            } else {
                member_set.remove(group_member);
            }
        }
        if !member_set.is_empty() {
            let emails = member_set.into_iter().collect::<Vec<String>>();
            if role != Role::NonMember {
                self.unsubscribe(group_email, emails, role);
            }
        }
    }
}

fn main() {
    env_logger::init();
    let database = env::var("DATABASE").expect("Database env var not present");

    let client = Client::connect("localhost", 27017).expect("Failed to connect to mongodb");

    let db = Database::new("localhost", 27017, &database);

    let api = Api::new(
        "http://10.135.57.30:8001/3.0",
        "restadmin",
        "CKtB8n86O4SocRv2T23r0IL5oxndClOzcDGZovDx5sP3rJUC",
    );

    let mut user_map = HashMap::new();
    let mut role_map = HashMap::new();
    let mut role_users_map = HashMap::new();

    let organization = db.get_organization("nidarholm");

    let member_group_string = String::from("member_group");
    let member_group_id = organization
        .get_str(member_group_string.as_str())
        .expect("No member_group field");

    let group = db.get_group_by_id(member_group_id);
    let members = group
        .get_array(String::from("members").as_str())
        .expect("Could not get members");

    for m in members {
        let mm = m.as_document().expect("Could not get document from member");
        let user_id = mm.get_str("user").expect("Could not get user id");
        let user = db.get_user_by_id(user_id);
        let in_list = user.get_bool("in_list").unwrap_or(false);
        let no_email = user.get_bool("no_email").unwrap_or(false);
        let email = user.get_str("email").unwrap_or("Could not get email");
        let user_groups = user.get_array("groups").expect("Could not get user_groups");
        let is_member = user_groups.iter().fold(false, |value, group_bson| {
            let group_id = group_bson.as_str().expect("No group id"); //.get_str("_id").expect("No _id field in group");
            value || member_group_id == group_id
        });
        // TODO: Remove hardcoding here as well - needed as I'm on leave:write!
        if email == "sigurdga@sigurdga.no" || in_list && !no_email && !email.is_empty() && is_member
        {
            user_map.insert(user_id, user);
        }

        let roles = client.db(&database).collection("roles");
        if mm.contains_key("roles") {
            let role_ids = mm.get_array("roles").expect("Could not get roles");
            for role_bson in role_ids {
                let role_id = role_bson.as_str().unwrap();
                let role_query = doc! {"_id" => role_id};
                let role = roles
                    .find_one(Some(role_query.clone()), None)
                    .expect("Could not find role");
                role_map.insert(role_id, role.unwrap());
                if !role_users_map.contains_key(role_id) {
                    role_users_map.insert(role_id, Vec::new());
                }
                role_users_map
                    .get_mut(&role_id)
                    .expect("Key not found, while it was already checked to be there")
                    .push(user_id);
            }
        }
    }

    // Set of all members
    // TODO: Should be possible to get the email value twice where we get it
    // from the memberlist above
    let all_members: HashSet<&str> = user_map
        .values()
        .map(|v| {
            v.get_str("email")
                .unwrap_or("Could not get email the second time")
        })
        .collect();

    // Find moderators to use for all lists
    let moderator_group = db.get_group_by_name("Listemoderatorer");
    let members_bson = moderator_group
        .get_array("members")
        .expect("Could not get members of moderator group");

    let mut moderator_emails: HashSet<&str> = HashSet::new();
    for mod_member in members_bson {
        let moderator_doc = mod_member
            .as_document()
            .expect("Could not convert moderator from bson");

        let user_id = moderator_doc
            .get_str("user")
            .expect("Could not get user from moderator document");
        let moderator_user = user_map
            .get(user_id)
            .unwrap_or_else(|| panic!("Could not get moderator from user map {}", user_id));
        let moderator_email = moderator_user
            .get_str("email")
            .expect("No email field in user object for moderator");
        if !moderator_email.is_empty() {
            moderator_emails.insert(moderator_email);
        }
    }
    // TODO: Do not override when things have stabilized
    let mut moderator_emails: HashSet<&str> = HashSet::new();
    moderator_emails.insert("sigurdga@sigurdga.no");

    // VERV-ADRESSER
    for (role_id, user_ids) in &role_users_map {
        let role = role_map
            .get(role_id)
            .expect("Could not get role from role_map");
        let role_email = role
            .get_str("email")
            .unwrap_or_else(|_| panic!("No email field in role {}", role_id));
        if role_email == "" {
            continue;
        }

        let mut emails: HashSet<&str> = HashSet::new();

        for user_id in user_ids {
            let user = user_map
                .get(user_id)
                .unwrap_or_else(|| panic!("Could not get user from user map {}", user_id));
            let user_email = user
                .get_str("email")
                .unwrap_or_else(|_| panic!("No email for user {}", user_id));
            if role_email != "" && user_email != "" {
                emails.insert(user_email);
            }
        }
        api.update_members(role_email, emails, Role::Member);
        api.update_members(role_email, moderator_emails.to_owned(), Role::Moderator);
    }

    // Used for special group "gruppeledere"
    let mut all_group_leaders: HashSet<&str> = HashSet::new();

    for group_bson in db.get_group_cursor() {
        let group = group_bson.unwrap();
        let group_email = group.get_str("group_email").unwrap_or("");

        let empty: Vec<bson::Bson> = Vec::new();
        let members = group.get_array("members").unwrap_or_else(|_| &empty);

        let mut group_members: HashSet<&str> = HashSet::new();
        let mut group_leaders: HashSet<&str> = HashSet::new();
        for _member in members {
            let member = _member
                .as_document()
                .expect("Could not extract member document");
            let user_id = member
                .get_str("user")
                .expect("Could not get user from member");
            if let Some(u) = user_map.get(user_id) {
                let user_email = u.get_str("email").unwrap_or("");
                if !user_email.is_empty() {
                    group_members.insert(user_email);

                    let group_leader_email =
                        group.get_str("group_leader_email").unwrap_or_else(|_| "");
                    if !group_leader_email.is_empty() {
                        let role_ids = member.get_array("roles").unwrap_or(&empty);
                        if !role_ids.is_empty() {
                            group_leaders.insert(user_email);
                            all_group_leaders.insert(user_email);
                        }
                    }
                }
            }
        }

        if !group_email.is_empty() {
            let group_leader_email = group.get_str("group_leader_email").unwrap_or_else(|_| "");
            if !group_leader_email.is_empty() {
                // Gruppe med gruppeledere
                api.update_members(group_leader_email, group_leaders.to_owned(), Role::Member);
                api.update_members(group_email, group_members.to_owned(), Role::Member);
                api.update_members(
                    group_leader_email,
                    moderator_emails.to_owned(),
                    Role::Moderator,
                );
                api.update_members(group_email, moderator_emails.to_owned(), Role::Moderator);
                api.update_members(
                    group_leader_email,
                    all_members
                        .difference(&group_leaders)
                        .map(|s| &**s)
                        .collect(),
                    Role::NonMember,
                );
                api.update_members(
                    group_email,
                    all_members
                        .difference(&group_members)
                        .map(|s| &**s)
                        .collect(),
                    Role::NonMember,
                );
            } else {
                // Gruppe uten gruppeledere
                api.update_members(group_email, group_members.to_owned(), Role::Member);
                api.update_members(group_email, moderator_emails.to_owned(), Role::Moderator);
                api.update_members(
                    group_email,
                    all_members
                        .difference(&group_members)
                        .map(|s| &**s)
                        .collect(),
                    Role::NonMember,
                );
            }
        }
    }

    api.update_members(
        "gruppeledere@nidarholm.no",
        all_group_leaders.to_owned(),
        Role::Member,
    );
    api.update_members(
        "gruppeledere@nidarholm.no",
        moderator_emails,
        Role::Moderator,
    );
    api.update_members(
        "gruppeledere@nidarholm.no",
        all_members
            .difference(&all_group_leaders)
            .map(|s| &**s)
            .collect(),
        Role::NonMember,
    );
}
