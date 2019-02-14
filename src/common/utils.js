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

/**
 * Urlifys a string.
 *
 * This is a simpler function than those trying to replace unicode characters.
 * We allow norwegian letters and hyphens, and replace everything else with
 * hyphens, then compacts hyphens.
 */
export function urlify(text: string) {
  return text
    .toLowerCase()
    .replace(/(?:[^\wæøå-]|_)+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
