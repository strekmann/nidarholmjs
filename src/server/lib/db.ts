import config from "config";
import mongoose from "mongoose";

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

if (process.env.NODE_ENV === "test") {
  mongoose.connect("mongodb://localhost/test", mongoOptions);
} else {
  const servers: string[] = config.get("mongodb.servers") || ["localhost"];
  mongoose.connect(servers.join(","), mongoOptions);
}
