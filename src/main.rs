use mongodb::db::ThreadedDatabase;
use mongodb::{doc, Client, ThreadedClient};
use reqwest;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::env;
use std::vec;

#[macro_use]
extern crate bson;

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
  user: String,
  http_etag: String,
}

#[derive(Debug, Deserialize)]
struct MemberList {
  start: usize,
  total_size: usize,
  #[serde(default = "MemberList::empty_vector")]
  entries: Vec<Member>,
  http_etag: String,
}

#[derive(Clone, Debug, Serialize)]
struct Subscription {
  list_id: String,
  subscriber: String,
  role: String,
  pre_verified: bool,
  pre_confirmed: bool,
  pre_approved: bool,
}

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

impl Api {
  fn get_members(&self, group_email: &str, role: &str) -> HashSet<String> {
    let url = format!(
      "{}/lists/{}/roster/{}",
      self.base_url,
      str::replace(group_email, "@", "."),
      role,
    );
    let mut response = self
      .client
      .get(url.as_str())
      .basic_auth(self.user.to_owned(), self.password.to_owned())
      .send()
      .expect("Error when getting members")
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
      member_set.insert(member.email.clone());
    }
    member_set
  }

  fn subscribe(&self, group_email: &str, group_member: &str, role: &str) {
    let subscription = Subscription {
      list_id: str::replace(group_email, "@", ".").to_string(),
      subscriber: group_member.to_string(),
      role: role.to_string(),
      pre_verified: true,
      pre_confirmed: true,
      pre_approved: true,
    };
    self
      .client
      .post(format!("{}/members", self.base_url).as_str())
      .basic_auth(self.user.to_owned(), self.password.to_owned())
      .form(&subscription)
      .send()
      .expect("Error in adding user")
      .error_for_status()
      .unwrap_or_else(|err| {
        panic!(
          "Add did not work for {} to {}: {}",
          subscription.subscriber, subscription.list_id, err
        )
      });
  }

  fn unsubscribe(&self, group_email: &str, emails: Vec<String>, role: &str) {
    let mut email_tuples: Vec<(String, String)> = Vec::new();
    for email in emails {
      email_tuples.push(("emails".to_string(), email));
    }
    let delete_url: String = format!(
      "{}/lists/{}/roster/{}",
      self.base_url,
      str::replace(group_email, "@", "."),
      role,
    );
    self
      .client
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
  fn update_members(&self, group_email: &str, members: Vec<&str>, role: &str) {
    let mut member_set = self.get_members(group_email, role);
    for group_member in members {
      if !member_set.contains(group_member) {
        self.subscribe(group_email, group_member, role);
      } else {
        member_set.remove(group_member);
      }
    }
    if !member_set.is_empty() {
      let emails = member_set.into_iter().collect::<Vec<String>>();
      self.unsubscribe(group_email, emails, role);
    }
  }
}

fn main() {
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
    .find_one(Some(organization_query.clone()), None)
    .expect("Did not find organization");

  let groups = client.db(&database).collection("groups");
  let org = organization.unwrap();
  let member_group_string = String::from("member_group");
  let member_group_id = org
    .get_str(member_group_string.as_str())
    .expect("No member_group field");
  let member_group_query = doc! {"_id" => member_group_id};
  let group = groups
    .find_one(Some(member_group_query.clone()), None)
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
        let email = u.get_str("email").unwrap_or("");
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
        dbg!("User id not found", user_id, mm);
      }
    }

    let roles = client.db(&database).collection("roles");
    if mm.contains_key("roles") {
      let role_ids = mm.get_array("roles").expect("Could not get roles");
      //dbg!(role_ids);
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

  // Find moderators to use for all lists
  let moderator_group_query = doc!("name" => "Listemoderatorer");
  let moderator_group_bson = groups
    .find_one(Some(moderator_group_query), None)
    .expect("Could not query list moderator group");
  let moderator_group = moderator_group_bson.unwrap();
  let members_bson = moderator_group
    .get_array("members")
    .expect("Could not get members of moderator group");

  let mut moderator_emails: Vec<&str> = Vec::new();
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
      moderator_emails.push(moderator_email);
    }
  }
  dbg!(&moderator_emails);
  // TODO: Do not override when things have stabilized
  let moderator_emails: Vec<&str> = vec!["sigurdga@sigurdga.no"];

  // VERV-ADRESSER
  for (role_id, user_ids) in &role_users_map {
    let role = role_map
      .get(role_id)
      .expect("Could not get role from role_map");
    let role_email = role.get_str("email").expect("No email field in role");
    if role_email == "" {
      continue;
    }

    let mut emails: Vec<&str> = Vec::new();

    for user_id in user_ids {
      let user = user_map
        .get(user_id)
        .unwrap_or_else(|| panic!("Could not get user from user map {}", user_id));
      let user_email = user.get_str("email").expect("No email field in user");

      if role_email != "" && user_email != "" {
        emails.push(user_email);
      }
    }
    api.update_members(role_email, emails, "member");
    api.update_members(role_email, moderator_emails.to_owned(), "moderator");
  }

  let all_groups = groups.find(None, None).expect("All groups query failed");
  for group_bson in all_groups {
    let group = group_bson.unwrap();
    let group_email = group.get_str("group_email").unwrap_or("");

    let empty: Vec<bson::Bson> = Vec::new();
    let members = group.get_array("members").unwrap_or_else(|_| &empty);

    let mut group_members: Vec<&str> = vec![];
    let mut group_leaders: Vec<&str> = vec![];
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
          group_members.push(user_email);

          let group_leader_email = group.get_str("group_leader_email").unwrap_or_else(|_| "");
          if !group_leader_email.is_empty() {
            let role_ids = member.get_array("roles").unwrap_or(&empty);
            if !role_ids.is_empty() {
              group_leaders.push(user_email);
            }
          }
        }
      }
    }

    if !group_email.is_empty() {
      let group_leader_email = group.get_str("group_leader_email").unwrap_or_else(|_| "");
      if !group_leader_email.is_empty() {
        // Gruppe med gruppeledere
        api.update_members(group_leader_email, group_leaders, "member");
        api.update_members(group_email, group_members, "member");
        api.update_members(group_leader_email, moderator_emails.to_owned(), "moderator");
        api.update_members(group_email, moderator_emails.to_owned(), "moderator");
      } else {
        // Gruppe uten gruppeledere
        api.update_members(group_email, group_members, "member");
        api.update_members(group_email, moderator_emails.to_owned(), "moderator");
      }
    }
  }
}
