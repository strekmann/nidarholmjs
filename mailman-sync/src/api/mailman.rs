// TODO: check if there is a decent mailman rust api soon

use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::str::FromStr;

#[derive(Copy, Clone, Debug, Serialize, PartialEq)]
pub enum ListRole {
    NonMember,
    Member,
    Moderator,
}

impl ListRole {
    pub const fn as_str(&self) -> &'static str {
        match self {
            Self::NonMember => "nonmember",
            Self::Member => "member",
            Self::Moderator => "moderator",
        }
    }
}

impl FromStr for ListRole {
    type Err = ();
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "nonmember" => Ok(Self::NonMember),
            "member" => Ok(Self::Member),
            "moderator" => Ok(Self::Moderator),
            _ => Err(()),
        }
    }
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

/** Member struct, containing address, delivery mode, display name, etc */
#[derive(Clone, Debug, Deserialize)]
pub struct Member {
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
pub struct MemberList {
    start: usize,
    total_size: usize,
    #[serde(default = "MemberList::empty_vector")]
    entries: Vec<Member>,
    http_etag: String,
}

impl MemberList {
    const fn empty_vector() -> Vec<Member> {
        let v: Vec<Member> = Vec::new();
        v
    }
}

#[derive(Clone, Debug, Serialize)]
struct UpdateModeration {
    moderation_action: String,
}

pub enum ModerationAction {
    Accept,
    Deny,
}

impl ModerationAction {
    pub const fn as_str(&self) -> &'static str {
        match self {
            Self::Accept => "accept",
            Self::Deny => "deny",
        }
    }
}

impl FromStr for ModerationAction {
    type Err = ();
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "accept" => Ok(Self::Accept),
            "deny" => Ok(Self::Deny),
            _ => Err(()),
        }
    }
}

/** Keeps the necessary services and variables */
pub struct Api {
    client: reqwest::Client,
    base_url: String,
    user: String,
    password: Option<String>,
}

impl Api {
    pub fn new(url: &str, user: &str, password: &str) -> Self {
        Self {
            client: reqwest::Client::new(),
            base_url: url.to_owned(),
            user: user.to_owned(),
            password: Some(password.to_owned()),
        }
    }

    fn get_members(&self, group_email: &str, role: ListRole) -> HashSet<String> {
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
                Some(_) => member_set.insert(member.email.to_owned()),
                None => false, // A nonmember on the list not registered by us (normal case for post etc)
            };
        }
        member_set
    }

    fn subscribe(&self, group_email: &str, group_member: &str, role: ListRole) {
        let subscription = Subscription {
            list_id: str::replace(group_email, "@", ".").to_lowercase(),
            subscriber: group_member.to_string().to_lowercase(),
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

        let res = response.expect("Error in adding user").error_for_status();

        if let Err(err) = res {
            error!(
                "Add did not work for {} to {}: {}, ({})",
                subscription.subscriber,
                subscription.list_id,
                subscription.role.as_str(),
                err
            );
        }
    }

    fn unsubscribe(&self, group_email: &str, emails: Vec<String>, role: ListRole) {
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
    fn set_moderation_action(&self, action: &str, role: ListRole, group_email: &str, email: &str) {
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
    pub fn update_members(&self, group_email: &str, members: HashSet<String>, role: ListRole) {
        debug!("Updating {}, {}", group_email, role.as_str());
        let mut member_set = self.get_members(group_email, role);
        for group_member in members {
            if !member_set.contains(&group_member) {
                self.subscribe(group_email, &group_member, role);
                if role == ListRole::NonMember {
                    self.set_moderation_action(
                        ModerationAction::Accept.as_str(),
                        role,
                        group_email,
                        &group_member,
                    );
                }
            } else {
                member_set.remove(&group_member);
            }
        }
        if !member_set.is_empty() {
            let emails = member_set.into_iter().collect::<Vec<String>>();
            if role != ListRole::NonMember {
                self.unsubscribe(group_email, emails, role);
            }
        }
    }
}
