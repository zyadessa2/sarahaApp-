import express from "express";
import bootstrap from "./src/bootstrap.js";
const app = express();

// import "dotenv/config";

// bootstrap(app, express);

// export default app;


export default async function handler(req, res) {
  const server = await bootstrap(app, express);
  server(req, res);
}