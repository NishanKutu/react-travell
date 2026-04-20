const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);

const localDatabase = "mongodb://127.0.0.1:27017/hikehub";

const connectDatabase = async () => {
  const primaryDatabase = process.env.DATABASE;
  const shouldPreferLocalDatabase =
    process.env.NODE_ENV !== "production" &&
    process.env.USE_REMOTE_DATABASE !== "true";
  const databaseUrls = shouldPreferLocalDatabase
    ? [localDatabase, primaryDatabase]
    : [primaryDatabase];

  if (!shouldPreferLocalDatabase && primaryDatabase !== localDatabase) {
    databaseUrls.push(localDatabase);
  }

  let lastError;

  for (const databaseUrl of [...new Set(databaseUrls.filter(Boolean))]) {
    try {
      await mongoose.connect(databaseUrl, { serverSelectionTimeoutMS: 5000 });
      const usingLocalDatabase = databaseUrl === localDatabase;
      console.log(
        `DATABASE CONNECTED SUCCESSFULLY${usingLocalDatabase ? " (local)" : ""}`
      );
      return mongoose.connection;
    } catch (error) {
      lastError = error;
      console.error("Database connection failed:", error.message);
    }
  }

  throw lastError || new Error("DATABASE environment variable is not set");
};

module.exports = connectDatabase();
