import { injectable } from "inversify";
import { Sequelize } from "sequelize";
import path from "path";
import { globalVariables } from "./variables.config.js";
import { TemplateModel } from "../models/template.model.js";
import { ContainerModel } from "../models/container.model.js";

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
    ContainerModel.initialize(this.sequelize);

    ContainerModel.hasMany(TemplateModel, {
      foreignKey: "containerId",
      sourceKey: "id",
    });

    TemplateModel.belongsTo(ContainerModel, {
      foreignKey: "containerId",
      targetKey: "id",
      onDelete: "CASCADE",
      as: "container",
    });
  }

  async connect() {
    this.initModels();
    await this.sequelize.authenticate();
    await this.sequelize.sync();
  }

  async alter() {
    this.initModels();

    await TemplateModel.sync({ alter: true });
    await ContainerModel.sync({ alter: true });

    await this.sequelize.sync({ alter: true });
  }

  async close() {
    await this.sequelize.close();
  }
}
