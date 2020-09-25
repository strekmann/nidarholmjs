import mongoose from "mongoose";

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true,
};

if (process.env.NODE_ENV === "test") {
  mongoose.connect("mongodb://localhost/test", mongoOptions);
} else {
  const mongoUrl: string =
    process.env.MONGO_URL || "mongodb://localhost/nidarholm-dev";
  mongoose.connect(mongoUrl, mongoOptions);
}
