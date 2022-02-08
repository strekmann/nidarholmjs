import File from "../models/File";
import Piece from "../models/Piece";

export default function insertFile(
  filename: string,
  hex: string,
  permissions: any,
  tags: string[],
  user: string,
  organization: string,
  piece = null,
  size: number,
  mimetype: string,
) {
  return new Promise((resolve, _reject) => {
    const file = new File({
      filename,
      hash: hex,
      mimetype,
      size,
      permissions,
      tags,
      organization,
      creator: user,
    });

    file.save().then((_file) => {
      if (piece) {
        Piece.findByIdAndUpdate(
          piece,
          { $addToSet: { scores: _file.id } },
          { new: true },
        )
          .exec()
          .then(() => {
            resolve(_file);
          });
      } else {
        resolve(_file);
      }
    });
  });
}
