import excel from "exceljs";
import tempy from "tempy";
import Piece from "./models/Piece";

export function downloadArchive(req, res, next) {
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet("Notearkivet");
  worksheet.columns = [
    { header: "Tittel", key: "title", width: 30 },
    { header: "Undertittel", key: "subtitle", width: 30 },
    { header: "Komponist(er)", key: "composers", width: 30 },
    { header: "Arrangør(er)", key: "arrangers", width: 30 },
    { header: "Digitale stemmer", key: "scores", width: 10 },
    { header: "Utgiver", key: "publisher", width: 20 },
    { header: "Id", key: "_id", width: 10 },
    { header: "Arkivnummer", key: "archive_number", width: 5 },
    { header: "Vedlikeholdsstatus", key: "maintenance_status", width: 30 },
  ];
  const query = Piece.find().sort("title");
  query.exec((err, pieces) => {
    pieces.forEach((p) => {
      const {
        _id,
        title,
        subtitle,
        composers,
        arrangers,
        scores,
        publisher,
        archive_number,
        maintenance_status,
      } = p;
      worksheet.addRow({
        _id,
        title,
        subtitle,
        composers: composers.join(" + "),
        arrangers: arrangers.join(" + "),
        scores: scores.length,
        publisher,
        archive_number,
        maintenance_status,
      });
    });

    const tempFilePath = tempy.file({ extension: ".xlsx" });
    workbook.xlsx.writeFile(tempFilePath).then(() => {
      res.setHeader("Filename", "nidarholm.xlsx");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=nidarholm.xlsx",
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8",
      );
      res.setHeader("Cache-Control", "max-age=7200, private, must-revalidate");
      res.sendFile(tempFilePath, (err: Error) => {
        if (err) {
          throw new Error(`Could not generate xslx: ${err}`);
        }
      });
      return res;
    });
  });
}
