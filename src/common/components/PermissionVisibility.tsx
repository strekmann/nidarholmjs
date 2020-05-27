import React from "react";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

type Props = {
  permissions: { public: boolean, groups: { id: string, name: string }[] },
};
export default function PermissionVisibility(props: Props) {
  if (!props.permissions.public || props.permissions.groups.length) {
    return <VisibilityOff color="disabled" />;
  }
  return null;
}
