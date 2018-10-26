/* @flow */

export type Friend = {
  +id: string,
  +name: ?string,
};

export type Group = {
  +id: string,
  +name: ?string,
};

export type PermissionObject = {
  +public: boolean,
  +groups: ?$ReadOnlyArray<?Group>,
  +users: ?$ReadOnlyArray<?Friend>,
};

export type PermissionArray = Array<{
  id: string,
  name: ?string,
}>;

export type Viewer = {
  +groups: ?$ReadOnlyArray<?Group>,
};
