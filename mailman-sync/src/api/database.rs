use crate::api::nidarholm::{Group, Member, Organization, Role, User};
use mongodb::db::ThreadedDatabase;
use mongodb::{bson, doc, Bson, Client, ThreadedClient};
use std::sync::Arc;

pub struct Database {
    database: Arc<mongodb::db::DatabaseInner>,
}

impl Database {
    pub fn new(host: &str, port: u16, database: &str) -> Self {
        Self {
            database: Client::connect(host, port)
                .expect("Failed to connect to mongodb")
                .db(database),
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
    pub fn get_organization(&self, name: &str) -> Organization {
        let organization_bson = self.get_document_by_key("organizations", "_id", name);
        let member_group_id = organization_bson
            .get_str("member_group")
            .expect("No member group");
        Organization {
            member_group_id: member_group_id.to_owned(),
        }
    }

    pub fn get_group_by_id(&self, id: &str) -> Group {
        let group_bson = self.get_document_by_key("groups", "_id", id);
        let email = group_bson.get_str("group_email").unwrap_or("").to_owned();
        let group_leader_email = group_bson
            .get_str("group_leader_email")
            .unwrap_or("")
            .to_owned();
        let members_bson = group_bson
            .get_array("members")
            .expect("Could not get members");
        let members = members_bson_to_members(members_bson);

        Group {
            members,
            email,
            group_leader_email,
        }
    }

    pub fn get_group_by_name(&self, name: &str) -> Group {
        let group_bson = self.get_document_by_key("groups", "name", name);
        let email = group_bson.get_str("group_email").unwrap_or("").to_owned();
        let group_leader_email = group_bson
            .get_str("group_leader_email")
            .unwrap_or("")
            .to_owned();
        let members_bson = group_bson
            .get_array("members")
            .expect("Could not get members");
        let members = members_bson_to_members(members_bson);

        Group {
            email,
            members,
            group_leader_email,
        }
    }

    pub fn get_all_groups(&self) -> Vec<Group> {
        let group_bsons = self
            .database
            .collection("groups")
            .find(None, None)
            .expect("Could not find all groups");

        let groups = group_bsons.map(|group_bson_result| {
            let group_bson = group_bson_result.unwrap();
            let email = group_bson.get_str("group_email").unwrap_or("").to_owned();
            let group_leader_email = group_bson
                .get_str("group_leader_email")
                .unwrap_or("")
                .to_owned();
            let members_bson_result = group_bson.get_array("members");
            if let Ok(members_bson) = members_bson_result {
                Group {
                    email,
                    group_leader_email,
                    members: members_bson_to_members(members_bson),
                }
            } else {
                Group {
                    email,
                    group_leader_email,
                    members: vec![],
                }
            }
        });
        groups.collect()
    }

    pub fn get_user_by_id(&self, id: &str) -> User {
        let user_bson = self.get_document_by_key("users", "_id", id);

        let in_list = user_bson.get_bool("in_list").unwrap_or(false);
        let no_email = user_bson.get_bool("no_email").unwrap_or(false);
        let email = user_bson
            .get_str("email")
            .unwrap_or("Could not get email")
            .to_lowercase();
        let groups_bson = user_bson
            .get_array("groups")
            .expect("Could not get user_groups");
        let group_ids = groups_bson
            .iter()
            .map(|b| b.as_str().expect("No group id").to_owned())
            .collect();

        User {
            email,
            in_list,
            no_email,
            group_ids,
        }
    }

    // TODO: store id
    pub fn get_role_by_id(&self, id: &str) -> Role {
        let role_bson = self.get_document_by_key("roles", "_id", id);
        let email = role_bson.get_str("email").unwrap_or("").to_owned();
        Role {
            id: id.to_owned(),
            email,
        }
    }

    // TODO: store id
    pub fn get_role_by_name(&self, name: &str) -> Role {
        let role_bson = self.get_document_by_key("roles", "name", name);
        let email = role_bson.get_str("email").unwrap_or("").to_owned();
        let id = role_bson.get_str("_id").unwrap().to_owned();
        Role { id, email }
    }
}

pub fn members_bson_to_members(members_bson: &[Bson]) -> Vec<Member> {
    members_bson
        .iter()
        .map(|m| {
            let member = m.as_document().expect("Could not get member document");
            let user_id = member.get_str("user").expect("Could not get user id");
            let role_ids = if member.contains_key("roles") {
                let role_ids_bson = member.get_array("roles").expect("Could not get roles");
                role_ids_bson
                    .iter()
                    .map(|r| r.as_str().unwrap().to_owned())
                    .collect()
            } else {
                Vec::new()
            };
            Member {
                user_id: user_id.to_owned(),
                role_ids,
            }
        })
        .collect()
}
