use std::collections::{HashMap, HashSet};
use std::env;

mod api;

use crate::api::database::Data;
use crate::api::mailman::{Api, ListRole};

#[tokio::main]
async fn main() {
    env_logger::init();
    let database_url = env::var("DATABASE_URL").expect("should be set");
    let mailman_url = env::var("MAILMAN_URL").expect("should be set");
    let mailman_username = env::var("MAILMAN_USERNAME").expect("username missing");
    let mailman_password = env::var("MAILMAN_PASSWORD").expect("password missing");

    let db = Data::new(&database_url).await;
    let api = Api::new(&mailman_url, &mailman_username, &mailman_password);

    let additional_accepted_non_members: HashSet<String> = vec![
        String::from("besetning@nidarholm.no"),
        String::from("okonomi@nidarholm.no"),
        String::from("info@nidarholm.no"),
        String::from("leder@nidarholm.no"),
        String::from("leder.turogfest@nidarholm.no"),
    ]
    .into_iter()
    .collect();

    let mut user_map = HashMap::new();
    let mut role_map = HashMap::new();
    let mut role_users_map = HashMap::new();

    let organization = db.get_organization("nidarholm").await;
    let member_group_id = &organization.member_group_id;

    let group = db.get_group_by_id(member_group_id).await;

    for member in group.members {
        let user = db.get_user_by_id(&member.user_id).await;
        let is_member = user.is_member(member_group_id);
        let in_lists = user.in_lists(is_member);
        if in_lists {
            user_map.insert(member.user_id.clone(), user);
        }

        for role_id in member.role_ids {
            let role = db.get_role_by_id(&role_id).await;
            role_map.insert(role_id.clone(), role.to_owned());
            if !role_users_map.contains_key(&role_id) {
                role_users_map.insert(role_id.clone(), Vec::new());
            }
            role_users_map
                .get_mut(&role_id)
                .expect("Key not found, while it was already checked to be there")
                .push(member.user_id.clone());
        }
    }

    // Set of all members
    let all_members: HashSet<String> = user_map
        .iter()
        .map(|(id, user)| {
            println!("{} {}", id, user.email);
            user.email.clone()
        })
        .collect();

    // Find moderators to use for all lists
    let moderator_group = db.get_group_by_name("Listemoderatorer").await;

    let mut moderator_emails: HashSet<String> = HashSet::new();
    for mod_member in moderator_group.members {
        let moderator_user = user_map.get(&mod_member.user_id).unwrap_or_else(|| {
            panic!(
                "Could not get moderator from user map {}",
                mod_member.user_id
            )
        });
        let moderator_email = &moderator_user.email;
        if !moderator_email.is_empty() {
            moderator_emails.insert(moderator_email.clone());
        }
    }
    // TODO: Do not override when things have stabilized
    let mut moderator_emails: HashSet<String> = HashSet::new();
    moderator_emails.insert(String::from("sigurdga@sigurdga.no"));

    // VERV-ADRESSER
    for (role_id, user_ids) in &role_users_map {
        let role = role_map
            .get(role_id)
            .expect("Could not get role from role_map");
        let role_email = &role.email;
        if role_email.is_empty() {
            continue;
        }

        let mut emails: HashSet<String> = HashSet::new();

        for user_id in user_ids {
            let user = user_map
                .get(user_id)
                .unwrap_or_else(|| panic!("Could not get user from user map {}", user_id));
            if !role_email.is_empty() && !user.email.is_empty() {
                emails.insert(user.email.to_owned());
            }
        }
        api.update_members(role_email, emails, ListRole::Member)
            .await;
        api.update_members(role_email, moderator_emails.clone(), ListRole::Moderator)
            .await;
        api.update_members(
            role_email,
            additional_accepted_non_members.clone(),
            ListRole::NonMember,
        )
        .await;
    }

    // Used for special group "gruppeledere"
    let mut all_group_leaders: HashSet<String> = HashSet::new();

    let concert_master_role = db.get_role_by_name("Konsertmester").await;
    match role_users_map.get(&concert_master_role.id) {
        None => {}
        Some(concert_masters) => {
            for user_id in concert_masters {
                if let Some(user) = user_map.get(user_id) {
                    if !user.email.is_empty() {
                        all_group_leaders.insert(user.email.to_owned());
                    }
                }
            }
        }
    }

    for group in db.get_all_groups().await {
        let mut group_members: HashSet<String> = HashSet::new();
        let mut group_leaders: HashSet<String> = HashSet::new();
        for member in group.members {
            let user_id = member.user_id;
            if let Some(user) = user_map.get(&user_id) {
                if !user.email.is_empty() {
                    group_members.insert(user.email.to_owned());

                    let group_leader_email = &group.group_leader_email;
                    if !group_leader_email.is_empty() {
                        let role_ids = member.role_ids;
                        if !role_ids.is_empty() {
                            group_leaders.insert(user.email.to_owned());
                            all_group_leaders.insert(user.email.to_owned());
                        }
                    }
                }
            }
        }

        if !group.email.is_empty() {
            let group_leader_email = group.group_leader_email;
            if group_leader_email.is_empty() {
                // Gruppe uten gruppeledere
                api.update_members(&group.email, group_members.clone(), ListRole::Member)
                    .await;
                api.update_members(&group.email, moderator_emails.clone(), ListRole::Moderator)
                    .await;
            } else {
                // Gruppe med gruppeledere
                api.update_members(&group_leader_email, group_leaders.clone(), ListRole::Member)
                    .await;
                api.update_members(&group.email, group_members.clone(), ListRole::Member)
                    .await;
                api.update_members(
                    &group_leader_email,
                    moderator_emails.clone(),
                    ListRole::Moderator,
                )
                .await;
                api.update_members(&group.email, moderator_emails.clone(), ListRole::Moderator)
                    .await;
                api.update_members(
                    &group_leader_email,
                    all_members.difference(&group_leaders).cloned().collect(),
                    ListRole::NonMember,
                )
                .await;
            }
            api.update_members(
                &group.email,
                all_members.difference(&group_members).cloned().collect(),
                ListRole::NonMember,
            )
            .await;
            api.update_members(
                &group.email,
                additional_accepted_non_members.to_owned(),
                ListRole::NonMember,
            )
            .await;
        }
    }

    let all_group_leaders_email = "gruppeledere@nidarholm.no";

    api.update_members(
        all_group_leaders_email,
        all_group_leaders.clone(),
        ListRole::Member,
    )
    .await;
    api.update_members(
        all_group_leaders_email,
        moderator_emails,
        ListRole::Moderator,
    )
    .await;
    api.update_members(
        all_group_leaders_email,
        all_members
            .difference(&all_group_leaders)
            .cloned()
            .collect(),
        ListRole::NonMember,
    )
    .await;
    api.update_members(
        all_group_leaders_email,
        additional_accepted_non_members,
        ListRole::NonMember,
    )
    .await;
}
