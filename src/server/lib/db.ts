import mongoose from "mongoose";

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

if (process.env.NODE_ENV === "test") {
  mongoose.connect("mongodb://localhost/test", mongoOptions);
} else {
  const mongoUrl: string = process.env.MONGO_URL || "localhost";
  mongoose.connect(mongoUrl, mongoOptions);
}
