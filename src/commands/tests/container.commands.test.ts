/* eslint @typescript-eslint/no-explicit-any: "off" */

import { ContainerModel } from "../../models/container.model.js";
import { ContainersRepository } from "../../repositories/container.repository.js";
import { ContainerCommands } from "../container.commands.js";
import { jest } from "@jest/globals";
import chalk from "chalk";

describe("Containers commands test", () => {
  let commands: ContainerCommands;
  let mockContainersRepository: jest.Mocked<ContainersRepository>;

  const mockContainer = {
    id: 1,
    name: "container",
  } as ContainerModel;

  beforeEach(() => {
    jest.clearAllMocks();

    mockContainersRepository = {
      getContainerByName: jest.fn(),
      createContainer: jest.fn(),
      getAllContainers: jest.fn(),
      getCurrentContainer: jest.fn(),
      switchToAnotherContainer: jest.fn(),
    } as unknown as jest.Mocked<ContainersRepository>;

    commands = new ContainerCommands(mockContainersRepository as ContainersRepository);
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

    it("switch to another container if name to equal null", async () => {
      const result = await commands.switchToAnotherContainer("null");

      expect(mockContainersRepository.switchToAnotherContainer).toHaveBeenCalledWith("null");
      expect(result).toEqual('switch to "null" container was saccessfully');
    });
  });
});
