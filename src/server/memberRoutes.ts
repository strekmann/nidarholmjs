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
    { header: "E-post", key: "email", width: 50 },
    { header: "Adresse", key: "address", width: 50 },
    { header: "Postnummer", key: "postcode" },
    { header: "Sted", key: "city", width: 20 },
    { header: "Født", key: "born", width: 20 },
    { header: "NMF-nummer", key: "nmfId" },
    { header: "Permittert", key: "onLeave" },
  ];

  const { member_group: memberGroupId } = await Organization.findById(
    "nidarholm",
  ).select("member_group");
  const group = await Group.findById(memberGroupId);
  for (const { user: userId } of group!.members) {
    //group!.members.forEach(async ({ user }) => {
    const user = await User.findById(userId);
    if (user && user.groups.includes(memberGroupId)) {
      //if (user_ && user_.membership_status && user_.membership_status < 5) {
      const {
        name,
        joined,
        phone,
        email,
        address,
        postcode,
        city,
        born,
        nmf_id: nmfId,
        on_leave: onLeave,
      } = user;
      worksheet.addRow({
        name,
        joined,
        phone,
        email,
        address,
        postcode,
        city,
        born,
        nmfId,
        onLeave,
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
