use bson::ordered::OrderedDocument;
use mongodb::db::ThreadedDatabase;
use mongodb::{doc, Client, ThreadedClient};
use std::sync::Arc;

pub struct Database {
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

    pub fn get_role_by_id(&self, id: &str) -> OrderedDocument {
        self.get_document_by_key("roles", "_id", id)
    }

    pub fn get_role_by_name(&self, name: &str) -> OrderedDocument {
        self.get_document_by_key("roles", "name", name)
    }
}
