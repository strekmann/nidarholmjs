import { sendPasswordEmail } from "../emailTasks";
import User from "../models/User";
import { Nullable, User as UserType } from "../../common/types";

export default async function sendPasswordToEmail(
  email: string,
  organization: any,
): Promise<Nullable<UserType>> {
  const pattern = new RegExp(email, "i");
  const user = await User.findOne({ email: { $regex: pattern } });
  if (user) {
    await sendPasswordEmail(organization, user);
    return user;
  }
  return null;
}
