import mongoose from "mongoose";
import config from "../../config";

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true,
};

export async function connect() {
  try {
    if (process.env.NODE_ENV === "test") {
      await mongoose.connect("mongodb://localhost/test", mongoOptions);
    } else {
      await mongoose.connect(config.mongo.url, mongoOptions);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
