import excel from "exceljs";
import tempy from "tempy";
import Group from "./models/Group";
import Organization from "./models/Organization";
import User from "./models/User";

export async function downloadMembers(req, res, next) {
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet("Medlemsliste");

  worksheet.columns = [
    { header: "Navn", key: "name", width: 50 },
    { header: "Startet", key: "joined", width: 20 },
    { header: "Telefon", key: "phone", width: 20 },
    { header: "Adresse", key: "address", width: 50 },
    { header: "Postnummer", key: "postcode" },
    { header: "Sted", key: "city", width: 20 },
    { header: "Født", key: "born", width: 20 },
    { header: "NMF-nummer", key: "nmfId" },
    { header: "Status", key: "membershipStatus" },
  ];

  const { member_group: memberGroup } = await Organization.findById(
    "nidarholm",
  ).select("member_group");
  const group = await Group.findById(memberGroup);
  for (const { user } of group!.members) {
    //group!.members.forEach(async ({ user }) => {
    const user_ = await User.findById(user);
    if (user_ && user_.membership_status && user_.membership_status < 5) {
      const {
        name,
        joined,
        phone,
        address,
        postcode,
        city,
        born,
        nmf_id: nmfId,
        membership_status: membershipStatus,
      } = user_;
      worksheet.addRow({
        name,
        joined,
        phone,
        address,
        postcode,
        city,
        born,
        nmfId,
        membershipStatus,
      });
    }
  }

  const tempFilePath = tempy.file({ extension: ".xlsx" });
  workbook.xlsx.writeFile(tempFilePath).then(() => {
    res.setHeader("Filename", "medlemmer.xlsx");
    res.setHeader("Content-Disposition", "attachment; filename=medlemmer.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8",
    );
    res.setHeader("Cache-Control", "max-age=7200, private, must-revalidate");
    res.sendFile(tempFilePath, (err: Error) => {
      if (err) {
        res.sendStatus(403);
      }
    });
    return res;
  });
}
