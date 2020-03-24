import "dotenv/config";
import express from "express";
import "express-async-errors";
import path from "path";
import routes from "./routes";
import * as Sentry from "@sentry/node";
import sentryConfig from "./config/sentry";
import Youch from "youch";
import "./database/index";

class App {
  constructor() {
    this.server = express();
    Sentry.init(sentryConfig);

    //Chamar os Middlawares e os Routes no Construct senão nunca serão chamados
    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    //Preparar a aplicação para receber requisições no formato de JSON
    this.server.use(express.json());
    this.server.use(
      "/files",
      express.static(path.resolve(__dirname, "..", "temp", "upload"))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();
        return res.status(500).json(errors);
      }
      return res.status(500).json({
        error: "Internal server error"
      })
    });
  }
}
//A única coisa que pode ser exportada desta classe é o SERVER
export default new App().server;