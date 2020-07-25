import moment from "moment";

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

export type Event = {
  id: string;
  title: string;
  location: string | null;
  start: moment.Moment | null;
  end: moment.Moment | null;
  mdtext: string;
  permissions: PermissionObject;
  highlighted: boolean;
  projects?: Array<{
    id: string;
    tag: string;
  }>;
  tags?: string[];
};

export type Project = {
  id: string;
  year: string;
  tag: string;
};
