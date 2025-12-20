import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
      "Please add it to your .env file."
  );
}

if (connectionString) {
  console.log("it works let goo !!!");
}

const sql = postgres(connectionString);

export default sql;
