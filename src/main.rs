use log::{debug, info, warn};
use mongodb::db::ThreadedDatabase;
use mongodb::{doc, Client, ThreadedClient};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::env;
use std::str::FromStr;

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

    let api = Api {
        client: reqwest::Client::new(),
        base_url: "http://10.135.57.30:8001/3.0".to_owned(),
        user: "restadmin".to_owned(),
        password: Some("CKtB8n86O4SocRv2T23r0IL5oxndClOzcDGZovDx5sP3rJUC".to_owned()),
    };

    let mut user_map = HashMap::new();
    let mut role_map = HashMap::new();
    let mut role_users_map = HashMap::new();

    let client = Client::connect("localhost", 27017).expect("Failed to connect to mongodb");

    let organizations = client.db(&database).collection("organizations");

    let organization_query = doc! {"_id" => "nidarholm"};
    let organization = organizations
        .find_one(Some(organization_query), None)
        .expect("Did not find organization");

    let groups = client.db(&database).collection("groups");
    let org = organization.unwrap();
    let member_group_string = String::from("member_group");
    let member_group_id = org
        .get_str(member_group_string.as_str())
        .expect("No member_group field");
    let member_group_query = doc! {"_id" => member_group_id};
    let group = groups
        .find_one(Some(member_group_query), None)
        .expect("Could not find member group");

    let g = group.unwrap();
    let members = g
        .get_array(String::from("members").as_str())
        .expect("Could not get members");

    for m in members {
        let mm = m.as_document().expect("Could not get document from member");
        let user_id = mm.get_str("user").expect("Could not get user id");
        let users = client.db(&database).collection("users");
        let user_query = doc! {"_id" => user_id};
        let user = users
            .find_one(Some(user_query.clone()), None)
            .expect("Could not find user");
        match user {
            Some(u) => {
                let in_list = u.get_bool("in_list").unwrap_or(false);
                let no_email = u.get_bool("no_email").unwrap_or(false);
                let email = u.get_str("email").unwrap_or("Could not get email");
                let user_groups = u.get_array("groups").expect("Could not get user_groups");
                let is_member = user_groups.iter().fold(false, |value, group_bson| {
                    let group_id = group_bson.as_str().expect("No group id"); //.get_str("_id").expect("No _id field in group");
                    value || member_group_id == group_id
                });
                if in_list && !no_email && !email.is_empty() && is_member {
                    user_map.insert(user_id, u);
                }
            }
            None => {
                warn!("User id not found {}: {}", user_id, mm);
            }
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
    let moderator_group_query = doc!("name" => "Listemoderatorer");
    let moderator_group_bson = groups
        .find_one(Some(moderator_group_query), None)
        .expect("Could not query list moderator group");
    let moderator_group = moderator_group_bson.unwrap();
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

    let all_groups = groups.find(None, None).expect("All groups query failed");
    for group_bson in all_groups {
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
