import { Client } from "pg";

export const dbClient = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const connectToDatabase = async () => {
  try {
    await dbClient.connect();
    console.log("Успешно свързване с базата данни");
  } catch (error) {
    console.error("Възникна грешка при свързване с базата данни:", error);
  }
};

export const closeDatabaseConnection = async () => {
  await dbClient.end();
  console.log("Връзката с базата данни е затворена");
};
