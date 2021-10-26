#[derive(Clone)]
pub struct Organization {
    pub member_group_id: String,
}

#[derive(Clone)]
pub struct Group {
    pub email: String,
    pub group_leader_email: String,
    pub members: Vec<Member>,
}

#[derive(Clone)]
pub struct Member {
    pub user_id: String,
    pub role_ids: Vec<String>,
}

#[derive(Clone)]
pub struct User {
    pub in_list: bool,
    pub no_email: bool,
    pub email: String,
    pub group_ids: Vec<String>,
}

#[derive(Clone)]
pub struct Role {
    pub id: String,
    pub email: String,
}

impl User {
    pub fn is_member(&self, organization_member_group_id: &str) -> bool {
        self.group_ids.iter().fold(false, |value, group_bson| {
            let group_id = group_bson.as_str();
            value || organization_member_group_id == group_id
        })
    }

    pub fn in_lists(&self, is_member: bool) -> bool {
        self.email == "sigurdga@sigurdga.no"
            || self.in_list && !self.no_email && !self.email.is_empty() && is_member
    }
}
