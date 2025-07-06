const express = require("express");
const cors = require("cors");
const testConnect = require("./db/testConnect");
const cookieParser = require("cookie-parser");

class AppController {
  constructor() {
    this.express = express();
    this.middlewares();
    this.routes();
    testConnect();
  }
  middlewares() {
    this.express.use(express.json());
    this.express.use(cors({
        origin: 'http://localhost:5000',
        credentials: true
    }));
    this.express.use(cookieParser());
  }
  routes() {
    const apiRoutes = require("./routes/apiRoutes");
    this.express.use("/reservas/v1", apiRoutes);
  }
}

module.exports = new AppController().express;