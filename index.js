import express from "express";
import bootstrap from "./src/bootstrap.js";
const app = express();

// import "dotenv/config";

// bootstrap(app, express);

// export default app;


import express from "express";
import bootstrap from "../bootstrap.js";

let server;

export default async function handler(req, res) {
  if (!server) {
    const app = express();
    await bootstrap(app, express);
    server = app;
  }

  return server(req, res);
}