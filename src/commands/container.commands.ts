import { inject, injectable } from "inversify";
import { ContainersRepository } from "../repositories/container.repository.js";
import chalk from "chalk";
import { TemplatesRepository } from "../repositories/template.repository.js";

@injectable()
export class ContainerCommands {
  constructor(
    @inject(ContainersRepository) private containersRepository: ContainersRepository,
    @inject(TemplatesRepository) private templatesRepository: TemplatesRepository,
  ) {}

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

  async updateContainer(containerName: string, newName: string) {
    if (!containerName || containerName.trim().length < 1) {
      throw new Error("the container name cannot be empty");
    } else if (containerName.trim().length > 50) {
      throw new Error("the container name is too long, max 50 characters");
    } else if (containerName.trim().toLowerCase() === "null") {
      throw new Error('you cannot update "null" container');
    }

    if (!newName || newName.trim().length < 1) {
      throw new Error("the new name cannot be empty");
    } else if (newName.trim().length > 50) {
      throw new Error("the new name is too long, max 50 characters");
    }

    const container = await this.containersRepository.getContainerByName(containerName.trim());

    if (!container) {
      throw new Error("container with this name not found");
    }

    const newNameContainer = await this.containersRepository.getContainerByName(newName.trim());

    if (newNameContainer) {
      throw new Error("container with this new name already exists");
    }

    await this.containersRepository.updateContainerById(container.id!, newName.trim());

    return "container has been successfully updated";
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

  async removeContainer(containerName: string) {
    if (containerName.trim() === "null") {
      throw new Error("you cannot remove this container");
    } else if (!containerName || containerName.trim().length < 1) {
      throw new Error("the name cannot be empty");
    } else if (containerName.trim().length > 50) {
      throw new Error("the name is too long, max 50 characters");
    }

    const container = await this.containersRepository.getContainerByName(containerName.trim());

    if (!container) {
      throw new Error("this container not found");
    }

    const currentContainer = await this.containersRepository.getCurrentContainer();

    if (currentContainer && containerName.trim() === currentContainer.name) {
      throw new Error(
        "you cannot remove the current container, please switch to another container",
      );
    }

    const templates = await this.templatesRepository.getAllTemplatesInContainer(
      containerName.trim(),
    );

    if (templates.length > 0) {
      throw new Error(
        "there are still items in this container, please delete them or move them to another container",
      );
    }

    await this.containersRepository.removeContainerById(container.id!);

    return `container "${container.name}" was successfully removed`;
  }
}
