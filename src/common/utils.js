/* eslint "import/prefer-default-export": 0 */

export function flattenPermissions(perms) {
    const permissions = [];
    if (perms.public) {
        permissions.push({ id: 'p', name: 'Verden' });
    }
    perms.groups.forEach((group) => {
        permissions.push({ id: group.id, name: group.name });
    });
    return permissions;
}
