import express from "express";
import bootstrap from "./src/bootstrap.js";

const app = express();

// Initialize app
await bootstrap(app, express);

export default app;