import { injectable } from "inversify";
import { ContainerModel } from "../models/container.model.js";
import fs from "fs";
import { globalVariables } from "../config/variables.config.js";

@injectable()
export class ContainersRepository {
  async getContainerByName(name: string) {
    const container = await ContainerModel.findOne({
      where: {
        name: name.trim(),
      },
      raw: true,
    });

    return container;
  }

  async getAllContainers(): Promise<ContainerModel[]> {
    const containers = await ContainerModel.findAll({
      raw: true,
    });

    return containers;
  }

  async createContainer(name: string) {
    await ContainerModel.create(
      {
        name: name.trim(),
      },
      { raw: true },
    );
  }

  async getCurrentContainer(): Promise<ContainerModel | null> {
    const configData = JSON.parse(fs.readFileSync(globalVariables.configPath, "utf-8"));

    const container = await ContainerModel.findOne({
      where: {
        name: configData.currentContainer,
      },
      raw: true,
    });

    return container;
  }

  async switchToAnotherContainer(containerName: string) {
    const configData = JSON.parse(fs.readFileSync(globalVariables.configPath, "utf-8"));
    configData.currentContainer = containerName.trim();
    fs.writeFileSync(globalVariables.configPath, JSON.stringify(configData, null, 2));
  }

  async updateContainerById(id: number, newName: string) {
    ContainerModel.update({ name: newName.trim() }, { where: { id: id } });
    this.switchToAnotherContainer(newName.trim());
  }

  async removeContainerById(id: number) {
    await ContainerModel.destroy({
      where: {
        id: id,
      },
    });
  }
}
