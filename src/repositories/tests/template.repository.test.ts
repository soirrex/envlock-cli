/* eslint @typescript-eslint/no-explicit-any: "off" */

import { jest } from "@jest/globals";
import { TemplatesRepository } from "../template.repository.js";
import { ContainersRepository } from "../container.repository.js";
import { TemplateModel } from "../../models/template.model.js";
import { ContainerModel } from "../../models/container.model.js";

describe("Password repository", () => {
  let repo: TemplatesRepository;

  let mockContainersRepository: jest.Mocked<ContainersRepository>;

  const mockTemplate = { id: "1", name: "name" } as TemplateModel;
  const mockContainer = { id: 1, name: "container" } as ContainerModel;

  const mockTemplateWithContainer = {
    ...mockTemplate,
    container: mockContainer,
  } as TemplateModel & { container: ContainerModel };

  beforeEach(() => {
    jest.clearAllMocks();

    mockContainersRepository = {
      getCurrentContainer: jest.fn(),
      getContainerByName: jest.fn(),
    } as unknown as jest.Mocked<ContainersRepository>;

    repo = new TemplatesRepository(mockContainersRepository as ContainersRepository);
  });

  describe("get template by name", () => {
    it("should return template by name", async () => {
      const getSpy = jest.spyOn(TemplateModel, "findOne").mockResolvedValue(mockTemplate);

      const result = await repo.getTemplateByName("  name ");

      expect(getSpy).toHaveBeenCalledWith({
        where: { name: "name" },
        include: [
          {
            as: "container",
            model: ContainerModel,
          },
        ],
        nest: true,
        raw: true,
      });

      expect(result).toEqual(mockTemplate);
    });

    it("should return null is template not found", async () => {
      const getSpy = jest.spyOn(TemplateModel, "findOne").mockResolvedValue(null);

      const result = await repo.getTemplateByName("  name ");

      expect(getSpy).toHaveBeenCalledWith({
        where: { name: "name" },
        include: [
          {
            as: "container",
            model: ContainerModel,
          },
        ],
        nest: true,
        raw: true,
      });

      expect(result).toEqual(null);
    });
  });

  describe("Create template", () => {
    it("should create template with current container id", async () => {
      mockContainersRepository.getCurrentContainer.mockResolvedValue(mockContainer);

      const createSpy = jest.spyOn(TemplateModel, "create").mockResolvedValue(mockTemplate);
      jest.spyOn(crypto, "randomUUID").mockReturnValue("018cf926-75ff-4e65-b0ca-276bb93554fd");

      const result = await repo.createTemplate("  name ", "desc", "enc", "salt", "iv", "tag");

      expect(createSpy).toHaveBeenCalledWith(
        {
          id: expect.any(String),
          containerId: mockContainer.id,
          name: "name",
          description: "desc",
          encrypted_data: "enc",
          salt: "salt",
          iv: "iv",
          tag: "tag",
        },
        { raw: true },
      );

      expect(result).toEqual(mockTemplate);
    });

    it("should create template if current container and description is null", async () => {
      mockContainersRepository.getCurrentContainer.mockResolvedValue(null);

      const createSpy = jest.spyOn(TemplateModel, "create").mockResolvedValue(mockTemplate);
      jest.spyOn(crypto, "randomUUID").mockReturnValue("018cf926-75ff-4e65-b0ca-276bb93554fd");

      const result = await repo.createTemplate("  name ", null, "enc", "salt", "iv", "tag");

      expect(createSpy).toHaveBeenCalledWith(
        {
          id: expect.any(String),
          containerId: null,
          name: "name",
          description: null,
          encrypted_data: "enc",
          salt: "salt",
          iv: "iv",
          tag: "tag",
        },
        { raw: true },
      );

      expect(result).toEqual(mockTemplate);
    });
  });

  describe("get all templates", () => {
    it("should return all templates", async () => {
      mockContainersRepository.getCurrentContainer.mockResolvedValue(mockContainer);

      const getSpy = jest
        .spyOn(TemplateModel, "findAll")
        .mockResolvedValue([mockTemplateWithContainer, mockTemplateWithContainer]);

      const result = await repo.getAllTemplates();

      expect(getSpy).toHaveBeenCalledWith({
        where: {
          containerId: mockContainer.id,
        },
        include: [{ model: ContainerModel, as: "container" }],
        raw: true,
        nest: true,
      });

      expect(result).toEqual([mockTemplateWithContainer, mockTemplateWithContainer]);
    });

    it("should return all templates when current container is null", async () => {
      mockContainersRepository.getCurrentContainer.mockResolvedValue(null);

      const getSpy = jest
        .spyOn(TemplateModel, "findAll")
        .mockResolvedValue([mockTemplateWithContainer, mockTemplateWithContainer]);

      const result = await repo.getAllTemplates();

      expect(getSpy).toHaveBeenCalledWith({
        where: {
          containerId: null,
        },
        include: [{ model: ContainerModel, as: "container" }],
        raw: true,
        nest: true,
      });

      expect(result).toEqual([mockTemplateWithContainer, mockTemplateWithContainer]);
    });

    it("should return all templates when ignoreCurrentContainer true", async () => {
      const getSpy = jest
        .spyOn(TemplateModel, "findAll")
        .mockResolvedValue([mockTemplateWithContainer, mockTemplateWithContainer]);

      const result = await repo.getAllTemplates(true);

      expect(getSpy).toHaveBeenCalledWith({
        include: [{ model: ContainerModel, as: "container" }],
        raw: true,
        nest: true,
      });

      expect(result).toEqual([mockTemplateWithContainer, mockTemplateWithContainer]);
    });
  });

  describe("get all templates in container", () => {
    it("get all templates in container", async () => {
      const getSpy = jest
        .spyOn(TemplateModel, "findAll")
        .mockResolvedValue([mockTemplateWithContainer, mockTemplateWithContainer]);

      const result = await repo.getAllTemplatesInContainer("  " + mockContainer.name + "      ");

      expect(getSpy).toHaveBeenCalledWith({
        include: [
          {
            model: ContainerModel,
            as: "container",
            required: true,
            where: {
              name: "container",
            },
          },
        ],
        raw: true,
        nest: true,
      });

      expect(result).toEqual([mockTemplateWithContainer, mockTemplateWithContainer]);
    });
  });

  describe("update template by id", () => {
    it("should update and return the template", async () => {
      const updateSpy = jest.spyOn(TemplateModel, "update").mockResolvedValue([1, []] as any);
      const getSpy = jest.spyOn(TemplateModel, "findOne").mockResolvedValue(mockTemplate);

      const result = await repo.updateTemplateById("id-1", " newname ", "desc");

      expect(updateSpy).toHaveBeenCalledWith(
        { name: "newname", description: "desc" },
        { where: { id: "id-1" }, returning: true },
      );

      expect(getSpy).toHaveBeenCalledWith({
        where: { id: "id-1" },
        raw: true,
      });

      expect(result).toEqual(mockTemplate);
    });
  });

  describe("remove template by name", () => {
    it("remove template", async () => {
      const destroySpy = jest.spyOn(TemplateModel, "destroy").mockResolvedValue(1);
      await repo.removeTemplateByName("  name ");
      expect(destroySpy).toHaveBeenCalledWith({ where: { name: "name" } });
    });
  });

  describe("move template to another container", () => {
    it("should throw error if container not found", async () => {
      mockContainersRepository.getContainerByName.mockResolvedValue(null);
      const updateSpy = jest.spyOn(TemplateModel, "update").mockResolvedValue([1, []] as any);

      await expect(
        repo.moveTemplateToAnotherContainer(mockTemplate.name, "wrong container"),
      ).rejects.toThrow(new Error("container with this name not found"));

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it("move template to another container", async () => {
      mockContainersRepository.getContainerByName.mockResolvedValue(mockContainer);
      const updateSpy = jest.spyOn(TemplateModel, "update").mockResolvedValue([1, []] as any);

      await repo.moveTemplateToAnotherContainer(mockTemplate.name, mockContainer.name);

      expect(updateSpy).toHaveBeenCalledWith(
        { containerId: 1 },
        { where: { name: "name" }, returning: true },
      );
    });

    it("move template to another container if container name to equal null", async () => {
      const updateSpy = jest.spyOn(TemplateModel, "update").mockResolvedValue([1, []] as any);

      await repo.moveTemplateToAnotherContainer(mockTemplate.name, "null");

      expect(updateSpy).toHaveBeenCalledWith(
        { containerId: null },
        { where: { name: "name" }, returning: true },
      );
    });
  });
});
