use std::collections::{HashMap, HashSet};
use std::env;

mod api;

use crate::api::database::Database;
use crate::api::mailman::Api;
use crate::api::nidarholm::Role;

#[macro_use]
extern crate bson;

fn main() {
    env_logger::init();
    let database = env::var("DATABASE").expect("Database env var not present");

    let db = Database::new("localhost", 27017, &database);

    let api = Api::new(
        "http://10.135.57.30:8001/3.0",
        "restadmin",
        "CKtB8n86O4SocRv2T23r0IL5oxndClOzcDGZovDx5sP3rJUC",
    );

    let additional_accepted_non_members: HashSet<&str> = vec![
        "besetning@nidarholm.no",
        "okonomi@nidarholm.no",
        "info@nidarholm.no",
        "leder@nidarholm.no",
        "leder.turogfest@nidarholm.no",
    ].into_iter().collect();

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

        if mm.contains_key("roles") {
            let role_ids = mm.get_array("roles").expect("Could not get roles");
            for role_bson in role_ids {
                let role_id = role_bson.as_str().unwrap();
                let role = db.get_role_by_id(role_id);
                role_map.insert(role_id, role);
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
        api.update_members(role_email, additional_accepted_non_members.to_owned(), Role::NonMember);
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
            if group_leader_email.is_empty() {
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
                api.update_members(group_email, additional_accepted_non_members.to_owned(), Role::NonMember);
            } else {
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
                api.update_members(group_email, additional_accepted_non_members.to_owned(), Role::NonMember);
            }
        }
    }

    let all_group_leaders_email = "gruppeledere@nidarholm.no";

    api.update_members(
        all_group_leaders_email,
        all_group_leaders.to_owned(),
        Role::Member,
    );
    api.update_members(
        all_group_leaders_email,
        moderator_emails,
        Role::Moderator,
    );
    api.update_members(
        all_group_leaders_email,
        all_members
            .difference(&all_group_leaders)
            .map(|s| &**s)
            .collect(),
        Role::NonMember,
    );
    api.update_members(all_group_leaders_email, additional_accepted_non_members.to_owned(), Role::NonMember);
}
