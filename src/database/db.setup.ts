import mongoose from "mongoose";
import config from "../config";

mongoose.connect(config.databaseUri, {
  dbName: "bun-test",
});

export default mongoose;
