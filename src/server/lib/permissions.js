import { fromGlobalId } from 'graphql-relay';

export function buildPermissionObject(permissions) {
    const permissionObj = { public: false, groups: [], users: [] };
    permissions.forEach(permission => {
        if (permission === 'p') {
            permissionObj.public = true;
        }
        const idObj = fromGlobalId(permission);
        if (idObj.type === 'Group') {
            permissionObj.groups.push(idObj.id);
        }
        else if (idObj.type === 'User') {
            permissionObj.users.push(idObj.id);
        }
    });
    return permissionObj;
}
