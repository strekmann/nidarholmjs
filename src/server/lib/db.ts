import mongoose from "mongoose";
import config from "../../config";

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true,
};

if (process.env.NODE_ENV === "test") {
  mongoose.connect("mongodb://localhost/test", mongoOptions);
} else {
  mongoose.connect(config.mongo.url, mongoOptions);
}
