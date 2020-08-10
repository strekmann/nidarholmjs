export type Nullable<T> = T | null;

export type Friend = {
  id: string;
  name?: string;
};

export type Group = {
  id: string;
  name?: string;
};

export type PermissionObject = {
  public: boolean;
  groups?: Group[];
  users?: Friend[];
};

export type PermissionArray = Array<{
  id?: string;
  name?: string;
}>;

export type Viewer = {
  groups?: Group[];
};

export type Organization = {
  name?: string;
};

export type User = {
  id?: string;
};
