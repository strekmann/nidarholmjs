import sendPasswordToEmail from "../database/sendPasswordToEmail";
import { Organization as OrganizationType } from "../../common/types";

export default async function sendReset(
  email: string,
  organization: any,
): Promise<OrganizationType> {
  if (!email) {
    return organization;
  }
  sendPasswordToEmail(email, organization);
  return organization;
}
