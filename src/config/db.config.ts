import { injectable } from "inversify";
import { Sequelize } from "sequelize";
import path from "path";
import { globalVariables } from "./variables.config.js";
import { TemplateModel } from "../models/template.model.js";

@injectable()
export class DBConfig {
  public readonly sequelize: Sequelize;

  constructor() {
    const dbPath = path.join(globalVariables.appDir, "database.sqlite");

    this.sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath,
      logging: false,
    });
  }

  private initModels() {
    TemplateModel.initialize(this.sequelize);
  }

  async connect() {
    this.initModels();
    await this.sequelize.authenticate();
    await this.sequelize.sync({ alter: true });
  }

  async close() {
    await this.sequelize.close();
  }
}
