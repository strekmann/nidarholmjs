use serde::Serialize;
use std::str::FromStr;

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
