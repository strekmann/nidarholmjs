/* @flow */
/* eslint "import/prefer-default-export": 0 */

import type { PermissionArray, PermissionObject } from "./types";

export function flattenPermissions(
  permissionObject: PermissionObject,
): PermissionArray {
  const permissionArray = [];
  if (permissionObject.public) {
    permissionArray.push({ id: "p", name: "Verden" });
  }
  if (permissionObject.groups) {
    permissionObject.groups.forEach((group) => {
      if (group) {
        permissionArray.push({ id: group.id, name: group.name });
      }
    });
  }
  return permissionArray;
}
