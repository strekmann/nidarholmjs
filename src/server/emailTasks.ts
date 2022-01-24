/* eslint "no-console": 0 */

import moment from "moment";
import nodemailer from "nodemailer";
import Event from "./models/Event";
import Group from "./models/Group";
import { IOrganization } from "./models/Organization";
import OrganizationEventGroupResponsibility from "./models/OrganizationEventGroupResponsibility";
import OrganizationEventPersonResponsibility, {
  IOrganizationEventPersonResponsibility,
} from "./models/OrganizationEventPersonResponsibility";
import PasswordCode from "./models/PasswordCode";
import User, { IUser } from "./models/User";
import config from "../config";

export function sendContactEmail({
  name,
  email,
  text,
  organization,
}: {
  name: string;
  email: string;
  text: string;
  organization: IOrganization;
}) {
  if (config.auth.smtp) {
    const transporter = nodemailer.createTransport(config.auth.smtp);
    const data = {
      from: `${name} <${email}>`,
      to: organization.email,
      subject: `Melding fra ${name} via nidarholm.no`,
      text: text.replace("\n", "\r\n"),
    };
    transporter.sendMail(data, (emailErr, emailInfo) => {
      console.info("EMAIL", emailErr, emailInfo, data);
      if (!emailErr) {
        const receipt = {
          from: organization.email,
          to: `${name} <${email}>`,
          subject: "Melding sendt",
          text:
            "Takk!\r\n\r\nMeldingen du sendte til styret via nidarholm.no har blitt mottatt.",
        };
        transporter.sendMail(receipt, (receiptErr, receiptInfo) => {
          console.info("RECEIPT:", receiptErr, receiptInfo, receipt);
        });
      }
    });
  } else {
    console.info("EMAIL", name, email, text);
  }
}

export function sendPasswordEmail(organization: IOrganization, user: IUser) {
  const code = new PasswordCode();
  code.user = user._id;
  return code.save().then((newCode) => {
    const message = `Hei ${user.name}\r\n\r\nDet kan se ut som du holder på å sette nytt passord. Hvis du ikke prøver på dette, ber vi deg se bort fra denne eposten. For å sette nytt passord, må du gå til lenka:\r\n${config.app.uri}/login/reset/${newCode._id}`;
    if (config.auth.smtp && config.auth.noreplyAddress) {
      const transporter = nodemailer.createTransport(config.auth.smtp);
      const mailOptions = {
        from: config.auth.noreplyAddress,
        to: `${user.name} <${user.email}>`,
        subject: "Nytt passord",
        text: message,
      };
      return transporter.sendMail(mailOptions).then((info) => {
        console.info("Email info:", info);
        return organization;
      });
    }
    console.info("No email config, this was the intended message:\n", message);
    return organization;
  });
}

export function sendReminderEmails() {
  const senderName = "Infoansvarlig, Nidarholm";
  const senderEmail = "informasjon@nidarholm.no";
  const now = moment();
  OrganizationEventPersonResponsibility.find({
    reminderAtHour: now.hour(),
    reminderText: { $exists: true },
  }).then((responsibilities) => {
    responsibilities.forEach((responsibility) => {
      const eventMoment = moment()
        .add(responsibility.reminderDaysBefore, "days")
        .hour(responsibility.reminderAtHour || 0)
        .startOf("hour");
      Event.find({
        "contributors.role": responsibility.id,
        start: {
          $lt: moment(eventMoment).endOf("day"),
          $gte: moment(eventMoment).startOf("day"),
        },
      }).then((events) => {
        events.forEach((event) => {
          const users = event.contributors
            .map((contributor) => {
              if (contributor.role !== responsibility.id) {
                return null;
              }
              return User.findOne({ _id: contributor.user }).then((user) => {
                if (user == null || user.email == null) {
                  return null;
                }
                const { name, email } = user;
                return {
                  name,
                  email,
                };
              });
            })
            .filter((user) => {
              return user;
            });
          Promise.all(users).then((resolvedUsers) => {
            const recipients = resolvedUsers
              .filter(objectHasNameAndEmail)
              .map((user) => {
                const { name, email: address } = user;
                return {
                  name,
                  address,
                };
              });
            if (config.auth.smtp) {
              const transporter = nodemailer.createTransport(config.auth.smtp);
              const data = {
                from: `${senderName} <${senderEmail}>`,
                to: recipients,
                subject: responsibility.name,
                text: responsibility.reminderText.replace("\n", "\r\n"),
              };
              transporter.sendMail(data, (emailErr, emailInfo) => {
                console.info("SENT:", emailErr, emailInfo);
              });
            } else {
              console.info(
                "EMAIL",
                senderName,
                senderEmail,
                recipients,
                responsibility.reminderText,
              );
            }
          });
        });
      });
    });
  });
  OrganizationEventGroupResponsibility.find({
    reminderAtHour: now.hour(),
    reminderText: { $exists: true },
  }).then((responsibilities) => {
    responsibilities.forEach((responsibility) => {
      const eventMoment = moment()
        .add(responsibility.reminderDaysBefore, "days")
        .hour(responsibility.reminderAtHour || 0)
        .startOf("hour");
      Event.find({
        "contributorGroups.role": responsibility.id,
        start: {
          $lt: moment(eventMoment).endOf("day"),
          $gte: moment(eventMoment).startOf("day"),
        },
      }).then((events) => {
        events.forEach((event) => {
          const groups = event.contributorGroups
            .map((contributorGroup) => {
              if (contributorGroup.role !== responsibility.id) {
                return null;
              }
              return Group.findOne({ _id: contributorGroup.group }).then(
                (group) => {
                  if (group == null || group.group_email == null) {
                    return null;
                  }
                  return {
                    name: group.name,
                    email: group.group_email,
                  };
                },
              );
            })
            .filter((group) => {
              return group;
            });
          Promise.all(groups).then((resolvedGroups) => {
            const recipients = resolvedGroups
              .filter(objectHasNameAndEmail)
              .map((group) => {
                const { name, email: address } = group;
                return {
                  name,
                  address,
                };
              });
            if (config.auth.smtp) {
              const transporter = nodemailer.createTransport(config.auth.smtp);
              const data = {
                from: `${senderName} <${senderEmail}>`,
                to: recipients,
                subject: responsibility.name,
                text: responsibility.reminderText.replace("\n", "\r\n"),
              };
              transporter.sendMail(data, (emailErr, emailInfo) => {
                console.info("SENT:", data, emailErr, emailInfo);
              });
            } else {
              console.info(
                "EMAIL",
                senderName,
                senderEmail,
                recipients,
                responsibility.reminderText,
              );
            }
          });
        });
      });
    });
  });
}

interface ObjectWithName {
  name: string;
}

interface ObjectWithEmail {
  email: string;
}

type ObjectWithNameAndEmail = ObjectWithName & ObjectWithEmail;

function objectHasName(obj: unknown): obj is ObjectWithName {
  return typeof obj === "object" && obj != null && "name" in obj;
}

function objectHasEmail(obj: unknown): obj is ObjectWithEmail {
  return typeof obj === "object" && obj != null && "email" in obj;
}

function objectHasNameAndEmail(obj: unknown): obj is ObjectWithNameAndEmail {
  return (
    objectHasName(obj) &&
    objectHasEmail(obj) &&
    obj.name != null &&
    obj.email != null
  );
}
