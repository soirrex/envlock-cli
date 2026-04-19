/* eslint @typescript-eslint/no-explicit-any: "off" */

import { ContainerModel } from "../../models/container.model.js";
import { TemplateModel } from "../../models/template.model.js";
import { ContainersRepository } from "../../repositories/container.repository.js";
import { TemplatesRepository } from "../../repositories/template.repository.js";
import { ContainerCommands } from "../container.commands.js";
import { jest } from "@jest/globals";
import chalk from "chalk";

describe("Containers commands test", () => {
  let commands: ContainerCommands;
  let mockContainersRepository: jest.Mocked<ContainersRepository>;
  let mockTemplatesRepository: jest.Mocked<TemplatesRepository>;

  const mockTemplate = {
    name: "template1",
    description: "description",
    encrypted_data: "base64string",
    salt: "base64salt",
    iv: "base64iv",
    tag: "base64tag",
    createdAt: new Date(),
  } as TemplateModel;

  const mockContainer = {
    id: 1,
    name: "container",
  } as ContainerModel;

  const mockTemplateWithContainer = {
    ...mockTemplate,
    container: mockContainer,
  } as TemplateModel & { container: ContainerModel };

  beforeEach(() => {
    jest.clearAllMocks();

    mockContainersRepository = {
      getContainerByName: jest.fn(),
      createContainer: jest.fn(),
      getAllContainers: jest.fn(),
      getCurrentContainer: jest.fn(),
      switchToAnotherContainer: jest.fn(),
      removeContainerById: jest.fn(),
      updateContainerById: jest.fn(),
    } as unknown as jest.Mocked<ContainersRepository>;

    mockTemplatesRepository = {
      getAllTemplatesInContainer: jest.fn(),
    } as unknown as jest.Mocked<TemplatesRepository>;

    commands = new ContainerCommands(
      mockContainersRepository as ContainersRepository,
      mockTemplatesRepository as TemplatesRepository,
    );
  });

  describe("Create container", () => {
    it("should throw error if name is empty", async () => {
      await expect(commands.createContainer("")).rejects.toThrow(
        new Error("the name cannot be empty"),
      );

      await expect(commands.createContainer("     ")).rejects.toThrow(
        new Error("the name cannot be empty"),
      );

      expect(mockContainersRepository.createContainer).not.toHaveBeenCalled();
    });

    it("should throw error if name is too long", async () => {
      await expect(commands.createContainer("a".repeat(51))).rejects.toThrow(
        new Error("the name is too long, max 50 characters"),
      );

      expect(mockContainersRepository.createContainer).not.toHaveBeenCalled();
    });

    it('should throw error if name to equal "null"', async () => {
      await expect(commands.createContainer("null")).rejects.toThrow(
        new Error('you cannot use "null" as a name'),
      );

      expect(mockContainersRepository.createContainer).not.toHaveBeenCalled();
    });

    it("should throw error if this name already exists", async () => {
      mockContainersRepository.getContainerByName.mockResolvedValue(mockContainer);

      await expect(commands.createContainer(mockContainer.name)).rejects.toThrow(
        new Error("container with this name already exists"),
      );

      expect(mockContainersRepository.createContainer).not.toHaveBeenCalled();
    });

    it("create container", async () => {
      mockContainersRepository.getContainerByName.mockResolvedValue(null);

      const result = await commands.createContainer(mockContainer.name);

      expect(mockContainersRepository.createContainer).toHaveBeenCalledWith(mockContainer.name);
      expect(result).toEqual("container created successfully");
    });
  });

  describe("Get all containers", () => {
    it("get all containers", async () => {
      mockContainersRepository.getAllContainers.mockResolvedValue([
        mockContainer,
        { id: 10, name: "container 2" } as ContainerModel,
      ]);
      mockContainersRepository.getCurrentContainer.mockResolvedValue(mockContainer);

      const result = await commands.getAllContainers();
      expect(result).toEqual(
        `\n- null\n- ${chalk.green("container")} | current container\n- container 2\n`,
      );
    });

    it("get all containers in current container is null", async () => {
      mockContainersRepository.getAllContainers.mockResolvedValue([
        mockContainer,
        { id: 10, name: "container 2" } as ContainerModel,
      ]);
      mockContainersRepository.getCurrentContainer.mockResolvedValue(null);

      const result = await commands.getAllContainers();

      expect(result).toEqual(
        `\n- ${chalk.green("null")} | current container\n- container\n- container 2\n`,
      );
    });
  });

  describe("Switch to another container", () => {
    it("should throw error if container not found", async () => {
      mockContainersRepository.getContainerByName.mockResolvedValue(null);

      await expect(commands.switchToAnotherContainer("container name")).rejects.toThrow(
        new Error("this container not found"),
      );
      expect(mockContainersRepository.switchToAnotherContainer).not.toHaveBeenCalled();
    });

    it("switch to another container", async () => {
      mockContainersRepository.getContainerByName.mockResolvedValue(mockContainer);

      const result = await commands.switchToAnotherContainer(mockContainer.name);

      expect(mockContainersRepository.switchToAnotherContainer).toHaveBeenCalledWith(
        mockContainer.name,
      );
      expect(result).toEqual(`switch to "${mockContainer.name}" container was saccessfully`);
    });

    it('switch to another container if the name is "null"', async () => {
      const result = await commands.switchToAnotherContainer("null");

      expect(mockContainersRepository.switchToAnotherContainer).toHaveBeenCalledWith("null");
      expect(result).toEqual('switch to "null" container was saccessfully');
    });
  });

  describe("Update container", () => {
    it("should throw error if container name is empty", async () => {
      await expect(commands.updateContainer("", "new name")).rejects.toThrow(
        new Error("the container name cannot be empty"),
      );
      expect(mockContainersRepository.updateContainerById).not.toHaveBeenCalled();
    });

    it("should throw error if container name is too long", async () => {
      await expect(commands.updateContainer("a".repeat(51), "new name")).rejects.toThrow(
        new Error("the container name is too long, max 50 characters"),
      );

      expect(mockContainersRepository.updateContainerById).not.toHaveBeenCalled();
    });

    it("should throw error if container name is empty", async () => {
      await expect(commands.updateContainer(mockContainer.name, "")).rejects.toThrow(
        new Error("the new name cannot be empty"),
      );

      expect(mockContainersRepository.updateContainerById).not.toHaveBeenCalled();
    });

    it("should throw error if container name is too long", async () => {
      await expect(commands.updateContainer(mockContainer.name, "a".repeat(51))).rejects.toThrow(
        new Error("the new name is too long, max 50 characters"),
      );

      expect(mockContainersRepository.updateContainerById).not.toHaveBeenCalled();
    });

    it("should throw error if container not found", async () => {
      mockContainersRepository.getContainerByName.mockResolvedValue(null);

      await expect(commands.updateContainer(mockContainer.name, "new name")).rejects.toThrow(
        new Error("container with this name not found"),
      );

      expect(mockContainersRepository.updateContainerById).not.toHaveBeenCalled();
    });

    it("should throw error if container with this new name already exists", async () => {
      mockContainersRepository.getContainerByName
        .mockResolvedValueOnce(mockContainer)
        .mockResolvedValueOnce(mockContainer);

      await expect(commands.updateContainer(mockContainer.name, "new name")).rejects.toThrow(
        new Error("container with this new name already exists"),
      );

      expect(mockContainersRepository.updateContainerById).not.toHaveBeenCalled();
    });

    it("update container", async () => {
      mockContainersRepository.getContainerByName
        .mockResolvedValueOnce(mockContainer)
        .mockResolvedValueOnce(null);

      const result = await commands.updateContainer(mockContainer.name, "new name");

      expect(mockContainersRepository.updateContainerById).toHaveBeenCalledWith(
        mockContainer.id,
        "new name",
      );
      expect(result).toEqual("container has been successfully updated");
    });
  });

  describe("Remove container", () => {
    it("should throw error if name is empty", async () => {
      await expect(commands.removeContainer("")).rejects.toThrow(
        new Error("the name cannot be empty"),
      );
      expect(mockContainersRepository.removeContainerById).not.toHaveBeenCalled();
    });

    it("should throw error if name is too long", async () => {
      await expect(commands.removeContainer("a".repeat(51))).rejects.toThrow(
        new Error("the name is too long, max 50 characters"),
      );
      expect(mockContainersRepository.removeContainerById).not.toHaveBeenCalled();
    });

    it('should throw error if the name is "null"', async () => {
      await expect(commands.removeContainer("null")).rejects.toThrow(
        new Error("you cannot remove this container"),
      );
      expect(mockContainersRepository.removeContainerById).not.toHaveBeenCalled();
    });

    it("should throw error if container not found", async () => {
      mockContainersRepository.getContainerByName.mockResolvedValue(null);

      await expect(commands.removeContainer(mockContainer.name)).rejects.toThrow(
        new Error("this container not found"),
      );
      expect(mockContainersRepository.removeContainerById).not.toHaveBeenCalled();
    });

    it("should throw error if the name matches the current container", async () => {
      mockContainersRepository.getContainerByName.mockResolvedValue(mockContainer);
      mockContainersRepository.getCurrentContainer.mockResolvedValue(mockContainer);

      await expect(commands.removeContainer(mockContainer.name)).rejects.toThrow(
        new Error("you cannot remove the current container, please switch to another container"),
      );
      expect(mockContainersRepository.removeContainerById).not.toHaveBeenCalled();
    });

    it("should throw error if there are still items in the container", async () => {
      mockContainersRepository.getContainerByName.mockResolvedValue(mockContainer);
      mockContainersRepository.getCurrentContainer.mockResolvedValue(null);
      mockTemplatesRepository.getAllTemplatesInContainer.mockResolvedValue([
        mockTemplateWithContainer,
      ]);

      await expect(commands.removeContainer(mockContainer.name)).rejects.toThrow(
        new Error(
          "there are still items in this container, please delete them or move them to another container",
        ),
      );
      expect(mockContainersRepository.removeContainerById).not.toHaveBeenCalled();
    });

    it("remove container", async () => {
      mockContainersRepository.getContainerByName.mockResolvedValue(mockContainer);
      mockContainersRepository.getCurrentContainer.mockResolvedValue(null);
      mockTemplatesRepository.getAllTemplatesInContainer.mockResolvedValue([]);

      const result = await commands.removeContainer(mockContainer.name);

      expect(mockContainersRepository.removeContainerById).toHaveBeenCalledWith(mockContainer.id);
      expect(result).toEqual(`container "${mockContainer.name}" was successfully removed`);
    });
  });
});
