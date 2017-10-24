import mongoose from 'mongoose';
import uuid from 'node-uuid';
import schemaOptions from './schemaOptions';

/* Organizations have users which may have a role. (Strictly, we allow roles to
 * all groups in the data model, but we should only implement this for the
 * Organization group at this point).
 *
 * The model Role is used to show titles for board members etc, in the member
 * list, but also as a way of synchronizing role based email aliases.
 *
 * Roles should be defined and managed per Organization.
 */

const RoleSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: uuid.v4 },
    name: { type: String, required: true },
    email: { type: String },
    organization: { type: String, ref: 'Organization' },
});

RoleSchema.set('toJSON', schemaOptions);
RoleSchema.set('toObject', schemaOptions);
RoleSchema.virtual('_type').get(() => {
    return 'Role';
});
export default mongoose.model('Role', RoleSchema);
