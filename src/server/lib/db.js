import Promise from "bluebird";
import config from "config";
import mongoose from "mongoose";

mongoose.Promise = Promise;

if (process.env.NODE_ENV === "test") {
  mongoose.connect(
    "mongodb://localhost/test",
    { useMongoClient: true },
  );
} else {
  const servers = config.get("mongodb.servers") || ["localhost"];
  mongoose.connect(
    servers.join(","),
    { useMongoClient: true },
  );
}
