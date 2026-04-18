import { inject, injectable } from "inversify";
import { ContainersRepository } from "../repositories/container.repository.js";
import chalk from "chalk";

@injectable()
export class ContainerCommands {
  constructor(@inject(ContainersRepository) private containersRepository: ContainersRepository) {}

  async createContainer(name: string) {
    if (!name || name.trim().length < 1) {
      throw new Error("the name cannot be empty");
    } else if (name.trim().length > 50) {
      throw new Error("the name is too long, max 50 characters");
    } else if (name.trim().toLowerCase() === "null") {
      throw new Error('you cannot use "null" as a name');
    }

    const container = await this.containersRepository.getContainerByName(name);
    if (container) {
      throw new Error("container with this name already exists");
    }

    await this.containersRepository.createContainer(name.trim());

    return "container created successfully";
  }

  async getAllContainers() {
    const containers = await this.containersRepository.getAllContainers();

    const currentContainer = await this.containersRepository.getCurrentContainer();

    let message = "";

    let currentContainerExists = false;

    for (const container of containers) {
      if (currentContainer && container.name === currentContainer.name) {
        message += `- ${chalk.green(container.name)} | current container\n`;
        currentContainerExists = true;
      } else {
        message += `- ${container.name}\n`;
      }
    }

    if (!currentContainerExists) {
      message = `- ${chalk.green("null")} | current container\n` + message;
    } else {
      message = `- null\n` + message;
    }

    return "\n" + message || "no containers found";
  }

  async switchToAnotherContainer(containerName: string) {
    if (containerName.trim() !== "null") {
      const container = await this.containersRepository.getContainerByName(containerName.trim());

      if (!container) {
        throw new Error("this container not found");
      }
    }

    await this.containersRepository.switchToAnotherContainer(containerName.trim());

    return `switch to "${containerName}" container was saccessfully`;
  }
}
