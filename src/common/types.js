/* @flow */

export type Friend = {
  id: string,
  name: string,
};

export type Group = {
  id: string,
  name: string,
};

export type PermissionObject = {
  public: boolean,
  groups: Array<Group>,
  friends: Array<Friend>,
};

export type Page = {
  id: string,
  created: string,
  creator: {
    name: string,
  },
  mdtext: string,
  permissions: PermissionObject,
  slug: string,
  summary: string,
  title: string,
  updated: string,
  updator: {
    name: string,
  },
};

export type PermissionArray = Array<{
  id: string,
  name: string,
}>;

export type Viewer = {
  friends: Array<Friend>,
  groups: Array<Group>,
};
