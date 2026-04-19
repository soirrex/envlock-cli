/* eslint @typescript-eslint/no-explicit-any: "off" */

import fs from "fs";
import { ContainerModel } from "../../models/container.model.js";
import { ContainersRepository } from "../container.repository.js";
import { globalVariables } from "../../config/variables.config.js";
import { jest } from "@jest/globals";

describe("ContainersRepository", () => {
  const repo = new ContainersRepository();

  const mockContainer = {
    id: 1,
    name: "test",
  } as ContainerModel;

  const configPath = "/path/config.json";

  beforeAll(() => {
    (globalVariables as any).configPath = configPath;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("Get container by name", () => {
    it("get containers by name", async () => {
      const getSpy = jest.spyOn(ContainerModel, "findOne").mockResolvedValue(mockContainer);

      const result = await repo.getContainerByName("  test  ");

      expect(getSpy).toHaveBeenCalledWith({
        where: { name: "test" },
        raw: true,
      });

      expect(result).toBe(mockContainer);
    });

    it("should return null if the container not found", async () => {
      const getSpy = jest.spyOn(ContainerModel, "findOne").mockResolvedValue(null);

      const result = await repo.getContainerByName("nope");

      expect(getSpy).toHaveBeenCalledWith({
        where: { name: "nope" },
        raw: true,
      });

      expect(result).toEqual(null);
    });
  });

  describe("get all containers", () => {
    it("returns all containers", async () => {
      const getSpy = jest
        .spyOn(ContainerModel, "findAll")
        .mockResolvedValue([mockContainer, mockContainer]);

      const result = await repo.getAllContainers();

      expect(getSpy).toHaveBeenCalledWith({
        raw: true,
      });

      expect(result).toEqual([mockContainer, mockContainer]);
    });
  });

  describe("Create container", () => {
    it("creates container with trimmed name", async () => {
      const getSpy = jest.spyOn(ContainerModel, "create").mockResolvedValue(undefined);

      await repo.createContainer("   name  ");

      expect(getSpy).toHaveBeenCalledWith(
        {
          name: "name",
        },
        { raw: true },
      );
    });
  });

  describe("Get current container", () => {
    it("should reads config and returns current container", async () => {
      const config = { currentContainer: "cur" };

      const readSpy = jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(config));
      const findOneSpy = jest.spyOn(ContainerModel, "findOne").mockResolvedValue(mockContainer);

      const result = await repo.getCurrentContainer();

      expect(readSpy).toHaveBeenCalledWith(configPath, "utf-8");
      expect(findOneSpy).toHaveBeenCalledWith({
        where: { name: config.currentContainer },
        raw: true,
      });

      expect(result).toEqual(mockContainer);
    });

    it("throws if config JSON is invalid", async () => {
      jest.spyOn(fs, "readFileSync").mockReturnValue("not-json");
      await expect(repo.getCurrentContainer()).rejects.toThrow(
        new Error("Unexpected token 'o', \"not-json\" is not valid JSON"),
      );
    });
  });

  describe("Switch to another container", () => {
    it("should update currentContainer and write to config file", async () => {
      const config = { currentContainer: "cur" };

      const readSpy = jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(config));
      const writeSpy = jest.spyOn(fs, "writeFileSync").mockReturnValue(undefined);

      await repo.switchToAnotherContainer("   new container        ");

      expect(readSpy).toHaveBeenCalledWith(configPath, "utf-8");
      expect(writeSpy).toHaveBeenCalledWith(
        configPath,
        JSON.stringify({ currentContainer: "new container" }, null, 2),
      );
    });

    it("throws if config JSON is invalid", async () => {
      jest.spyOn(fs, "readFileSync").mockReturnValue("not-json");
      await expect(repo.switchToAnotherContainer("new container")).rejects.toThrow(
        new Error("Unexpected token 'o', \"not-json\" is not valid JSON"),
      );
    });
  });

  describe("Update container", () => {
    it("update container", async () => {
      jest.spyOn(repo, "switchToAnotherContainer").mockImplementation(async () => {});

      const updateSpy = jest.spyOn(ContainerModel, "update").mockResolvedValue([1, []] as any);

      await repo.updateContainerById(1, "new name");

      expect(updateSpy).toHaveBeenCalledWith({ name: "new name" }, { where: { id: 1 } });
    });
  });

  describe("Remove contaienr", () => {
    it("remove contaienr", async () => {
      const removeSpy = jest.spyOn(ContainerModel, "destroy").mockResolvedValue(0);

      await repo.removeContainerById(1);

      expect(removeSpy).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
    });
  });
});
