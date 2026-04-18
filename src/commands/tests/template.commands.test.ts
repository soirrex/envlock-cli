/* eslint @typescript-eslint/no-explicit-any: "off" */

import { PasswordRepository } from "../../repositories/password.repository.js";
import { jest } from "@jest/globals";
import { EnvTemplateCommands } from "../template.commands.js";
import { CryptoService } from "../../services/crypto.service.js";
import { TemplatesRepository } from "../../repositories/template.repository.js";
import { TemplateModel } from "../../models/template.model.js";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { ContainerModel } from "../../models/container.model.js";

describe("Template commands test", () => {
  let commands: EnvTemplateCommands;

  let mockPasswordRepository: jest.Mocked<PasswordRepository>;
  let mockCryptoService: jest.Mocked<CryptoService>;
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
    name: "container1",
  } as ContainerModel;

  const mockTemplateWithContainer = {
    ...mockTemplate,
    container: mockContainer,
  } as TemplateModel & { container: ContainerModel };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPasswordRepository = {
      getMasterPassword: jest.fn(),
      setMasterPassword: jest.fn(),
      removeMasterPassword: jest.fn(),
    } as unknown as jest.Mocked<PasswordRepository>;

    mockCryptoService = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    } as unknown as jest.Mocked<CryptoService>;

    mockTemplatesRepository = {
      createTemplate: jest.fn(),
      getTemplateByName: jest.fn(),
      removeTemplateByName: jest.fn(),
      getAllTemplates: jest.fn(),
      updateTemplateById: jest.fn(),
    } as unknown as jest.Mocked<TemplatesRepository>;

    commands = new EnvTemplateCommands(
      mockPasswordRepository as PasswordRepository,
      mockCryptoService as CryptoService,
      mockTemplatesRepository as TemplatesRepository,
    );
  });

  describe("Save template", () => {
    it("should throw error if name is empty", async () => {
      await expect(commands.saveTemplate("")).rejects.toThrow("the name cannot be empty");
      expect(mockTemplatesRepository.createTemplate).not.toHaveBeenCalled();
    });

    it("should throw error if name is too long", async () => {
      await expect(commands.saveTemplate("a".repeat(60))).rejects.toThrow(
        "the name is too long, max 50 characters",
      );
      expect(mockTemplatesRepository.createTemplate).not.toHaveBeenCalled();
    });

    it("should throw error if description is too long", async () => {
      await expect(commands.saveTemplate(mockTemplate.name, "a".repeat(210))).rejects.toThrow(
        "the description is too long, max 200 characters",
      );

      expect(mockTemplatesRepository.createTemplate).not.toHaveBeenCalled();
    });

    it("should throw error if user don't have a password", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue(null);

      await expect(commands.saveTemplate(mockTemplate.name)).rejects.toThrow(
        "you don't have a master password",
      );

      expect(mockTemplatesRepository.createTemplate).not.toHaveBeenCalled();
    });

    it("should throw error if this name already exists", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(mockTemplateWithContainer);

      await expect(commands.saveTemplate(mockTemplate.name)).rejects.toThrow(
        "this name already exists",
      );

      await expect(commands.saveTemplate(mockTemplate.name + "  ")).rejects.toThrow(
        "this name already exists",
      );

      expect(mockTemplatesRepository.createTemplate).not.toHaveBeenCalled();
    });

    it("should throw error if template is empty", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(null);

      jest.spyOn(inquirer, "prompt" as any).mockResolvedValue({ template: "" });

      await expect(commands.saveTemplate(mockTemplate.name)).rejects.toThrow(
        "the template cannot be empty, please enter the .env template",
      );

      expect(mockTemplatesRepository.createTemplate).not.toHaveBeenCalled();
    });

    it("save template with manual input", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(null);
      mockCryptoService.encrypt.mockReturnValue({
        encrypted_data: mockTemplate.encrypted_data,
        salt: mockTemplate.salt,
        iv: mockTemplate.iv,
        tag: mockTemplate.tag,
      });

      jest.spyOn(inquirer, "prompt" as any).mockResolvedValue({ template: "template text data" });

      const result = await commands.saveTemplate(mockTemplate.name);

      expect(mockCryptoService.encrypt).toHaveBeenCalledWith("password", "template text data");
      expect(mockTemplatesRepository.createTemplate).toHaveBeenCalledWith(
        mockTemplate.name,
        null,
        mockTemplate.encrypted_data,
        mockTemplate.salt,
        mockTemplate.iv,
        mockTemplate.tag,
      );

      expect(result).toEqual("the template has been successfully saved");
    });

    it("save template with manual input with a different password", async () => {
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(null);
      mockCryptoService.encrypt.mockReturnValue({
        encrypted_data: mockTemplate.encrypted_data,
        salt: mockTemplate.salt,
        iv: mockTemplate.iv,
        tag: mockTemplate.tag,
      });

      jest
        .spyOn(inquirer, "prompt" as any)
        .mockResolvedValueOnce({ password: "different password" })
        .mockResolvedValueOnce({ template: "template text data" });

      const result = await commands.saveTemplate(mockTemplate.name, undefined, undefined, true);

      expect(mockCryptoService.encrypt).toHaveBeenCalledWith(
        "different password",
        "template text data",
      );
      expect(mockTemplatesRepository.createTemplate).toHaveBeenCalledWith(
        mockTemplate.name,
        null,
        mockTemplate.encrypted_data,
        mockTemplate.salt,
        mockTemplate.iv,
        mockTemplate.tag,
      );

      expect(result).toEqual("the template has been successfully saved");
    });

    it("should throw error if file not found", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(null);

      jest.spyOn(fs, "existsSync" as any).mockReturnValue(false);

      await expect(
        commands.saveTemplate(
          mockTemplate.name,
          mockTemplate.description as string,
          "/path/to/.env",
        ),
      ).rejects.toThrow("the file not found");

      expect(mockTemplatesRepository.createTemplate).not.toHaveBeenCalled();
    });

    it("save template with copy file", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(null);
      mockCryptoService.encrypt.mockReturnValue({
        encrypted_data: "encrypted_datainbase64",
        salt: "random_salt",
        iv: "random_iv",
        tag: "auth_tag",
      });

      jest.spyOn(fs, "existsSync" as any).mockReturnValue(true);
      jest.spyOn(fs, "readFileSync" as any).mockReturnValue("template text data");

      const result = await commands.saveTemplate(
        mockTemplate.name,
        mockTemplate.description as string,
        "/path/to/.env",
      );

      expect(result).toEqual("the template has been successfully saved");

      expect(mockCryptoService.encrypt).toHaveBeenCalledWith("password", "template text data");
      expect(mockTemplatesRepository.createTemplate).toHaveBeenCalledWith(
        mockTemplate.name,
        mockTemplate.description,
        "encrypted_datainbase64",
        "random_salt",
        "random_iv",
        "auth_tag",
      );
    });

    it("should throw error if different password is empty", async () => {
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(null);
      mockCryptoService.encrypt.mockReturnValue({
        encrypted_data: "encrypted_datainbase64",
        salt: "random_salt",
        iv: "random_iv",
        tag: "auth_tag",
      });

      jest.spyOn(fs, "existsSync" as any).mockReturnValue(true);
      jest.spyOn(fs, "readFileSync" as any).mockReturnValue("template text data");

      jest.spyOn(inquirer, "prompt" as any).mockResolvedValue({ password: "" });

      await expect(
        commands.saveTemplate(
          mockTemplate.name,
          mockTemplate.description as string,
          "/path/to/.env",
          true,
        ),
      ).rejects.toThrow("the password cannot be empty, please enter a valid password");

      expect(mockTemplatesRepository.createTemplate).not.toHaveBeenCalled();
    });

    it("save template with copy file with a different password", async () => {
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(null);
      mockCryptoService.encrypt.mockReturnValue({
        encrypted_data: "encrypted_datainbase64",
        salt: "random_salt",
        iv: "random_iv",
        tag: "auth_tag",
      });

      jest.spyOn(fs, "existsSync" as any).mockReturnValue(true);
      jest.spyOn(fs, "readFileSync" as any).mockReturnValue("template text data");

      jest.spyOn(inquirer, "prompt" as any).mockResolvedValue({ password: "different password" });

      const result = await commands.saveTemplate(
        mockTemplate.name,
        mockTemplate.description as string,
        "/path/to/.env",
        true,
      );

      expect(result).toEqual("the template has been successfully saved");

      expect(mockCryptoService.encrypt).toHaveBeenCalledWith(
        "different password",
        "template text data",
      );
      expect(mockTemplatesRepository.createTemplate).toHaveBeenCalledWith(
        mockTemplate.name,
        mockTemplate.description,
        "encrypted_datainbase64",
        "random_salt",
        "random_iv",
        "auth_tag",
      );
    });
  });

  describe("Get all templates", () => {
    it("get all user templates", async () => {
      mockTemplatesRepository.getAllTemplates.mockResolvedValue([mockTemplateWithContainer]);

      const result = await commands.getAllTemplates();

      expect(result).toEqual({
        "template 1": {
          createdAt: mockTemplate.createdAt.toLocaleString(),
          description: mockTemplate.description,
          name: mockTemplate.name,
          container: mockTemplateWithContainer.container.name,
        },
      });
    });
  });

  describe("Get template by name", () => {
    it("should throw error if name is empty", async () => {
      await expect(commands.getTemplateByName("    ")).rejects.toThrow("the name cannot be empty");
    });

    it("should throw error if user don't have a password", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue(null);

      await expect(commands.getTemplateByName(mockTemplate.name)).rejects.toThrow(
        "you don't have a master password",
      );
    });

    it("should throw error if template not found", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(null);

      await expect(commands.getTemplateByName(mockTemplate.name)).rejects.toThrow(
        "this template not found",
      );
    });

    it("get template by name", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(mockTemplateWithContainer);
      mockCryptoService.decrypt.mockReturnValue("template data");

      const result = await commands.getTemplateByName(mockTemplate.name);

      expect(result).toEqual("\n" + "template data");

      expect(mockCryptoService.decrypt).toHaveBeenCalledWith(
        "password",
        mockTemplate.encrypted_data,
        mockTemplate.salt,
        mockTemplate.iv,
        mockTemplate.tag,
      );
    });

    it("should throw error if the different password is empty", async () => {
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(mockTemplateWithContainer);
      mockCryptoService.decrypt.mockReturnValue("template data");

      jest.spyOn(inquirer, "prompt" as any).mockResolvedValue({ password: "" });

      await expect(commands.getTemplateByName(mockTemplate.name, true)).rejects.toThrow(
        "the password cannot be empty, please enter a valid password",
      );

      expect(mockCryptoService.decrypt).not.toHaveBeenCalled();
    });

    it("get template by name with a different password", async () => {
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(mockTemplateWithContainer);
      mockCryptoService.decrypt.mockReturnValue("template data");

      jest.spyOn(inquirer, "prompt" as any).mockResolvedValue({ password: "different password" });

      const result = await commands.getTemplateByName(mockTemplate.name, true);

      expect(result).toEqual("\n" + "template data");

      expect(mockCryptoService.decrypt).toHaveBeenCalledWith(
        "different password",
        mockTemplate.encrypted_data,
        mockTemplate.salt,
        mockTemplate.iv,
        mockTemplate.tag,
      );
    });
  });

  describe("Write template to file", () => {
    it("should throw error if name is empty", async () => {
      await expect(commands.writeTemplateToFile("  ", "path/to/file")).rejects.toThrow(
        "the name cannot be empty",
      );

      expect(mockCryptoService.decrypt).not.toHaveBeenCalled();
    });

    it("should throw error if user don't have a password", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue(null);

      await expect(commands.writeTemplateToFile(mockTemplate.name, "path/to/file")).rejects.toThrow(
        "you don't have a master password",
      );

      expect(mockCryptoService.decrypt).not.toHaveBeenCalled();
    });

    it("should throw error if file not found", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(null);

      jest.spyOn(fs, "existsSync" as any).mockReturnValue(false);

      await expect(
        commands.writeTemplateToFile(mockTemplate.name, "/path/to/file"),
      ).rejects.toThrow("the file not found");
    });

    it("should throw error if template not found", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      jest.spyOn(fs, "existsSync" as any).mockReturnValue(true);
      jest.spyOn(fs, "readFileSync" as any).mockReturnValue("");

      await expect(
        commands.writeTemplateToFile(mockTemplate.name, "/path/to/file"),
      ).rejects.toThrow("this template not found");
    });

    it("should append template to file with overwrite disabled", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(mockTemplateWithContainer);
      mockCryptoService.decrypt.mockReturnValue("decrypted content");

      jest.spyOn(fs, "existsSync" as any).mockReturnValue(true);
      jest.spyOn(fs, "appendFileSync").mockImplementation(() => {});

      const result = await commands.writeTemplateToFile(mockTemplate.name, "/path/to/file", false);

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), "/path/to/file"),
        "\ndecrypted content",
        "utf8",
      );

      expect(result).toEqual("the template has been successfully written to the file");
    });

    it("should write template to file with overwrite enabled", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(mockTemplateWithContainer);
      mockCryptoService.decrypt.mockReturnValue("decrypted content");

      jest.spyOn(fs, "existsSync" as any).mockReturnValue(true);
      jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});

      const result = await commands.writeTemplateToFile(mockTemplate.name, "/path/to/file", true);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), "/path/to/file"),
        "decrypted content",
        "utf8",
      );

      expect(result).toEqual("the template has been successfully written to the file");
    });

    it("should throw error in different password is empty", async () => {
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(mockTemplateWithContainer);
      mockCryptoService.decrypt.mockReturnValue("decrypted content");

      jest.spyOn(fs, "existsSync" as any).mockReturnValue(true);
      jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});

      jest.spyOn(inquirer, "prompt" as any).mockResolvedValueOnce({ password: "" });

      await expect(
        commands.writeTemplateToFile(mockTemplate.name, "/path/to/file", true, true),
      ).rejects.toThrow("the password cannot be empty, please enter a valid password");

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it("should write template to file with overwrite enabled with a different password", async () => {
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(mockTemplateWithContainer);
      mockCryptoService.decrypt.mockReturnValue("decrypted content");

      jest.spyOn(fs, "existsSync" as any).mockReturnValue(true);
      jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});

      jest
        .spyOn(inquirer, "prompt" as any)
        .mockResolvedValueOnce({ password: "different password" });

      const result = await commands.writeTemplateToFile(
        mockTemplate.name,
        "/path/to/file",
        true,
        true,
      );

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), "/path/to/file"),
        "decrypted content",
        "utf8",
      );

      expect(result).toEqual("the template has been successfully written to the file");
    });
  });

  describe("Update template", () => {
    it("should throw error if name is empty", async () => {
      await expect(commands.updateTemplateByName("  ")).rejects.toThrow("the name cannot be empty");
      expect(mockTemplatesRepository.updateTemplateById).not.toHaveBeenCalled();
    });

    it("should throw error if no items are specified for the update", async () => {
      await expect(commands.updateTemplateByName(mockTemplate.name)).rejects.toThrow(
        "you must update at least one thing",
      );
      expect(mockTemplatesRepository.updateTemplateById).not.toHaveBeenCalled();
    });

    it("should throw error if newName is specified and is empty", async () => {
      await expect(commands.updateTemplateByName(mockTemplate.name, "   ")).rejects.toThrow(
        "the name cannot be empty",
      );
      expect(mockTemplatesRepository.updateTemplateById).not.toHaveBeenCalled();
    });

    it("should throw error if newName is too long", async () => {
      await expect(
        commands.updateTemplateByName(mockTemplate.name, "a".repeat(51)),
      ).rejects.toThrow("the name is too long, max 50 characters");
      expect(mockTemplatesRepository.updateTemplateById).not.toHaveBeenCalled();
    });

    it("should throw error if newDescription is too long", async () => {
      await expect(
        commands.updateTemplateByName(mockTemplate.name, "newName", "a".repeat(201)),
      ).rejects.toThrow("the description is too long, max 200 characters");
      expect(mockTemplatesRepository.updateTemplateById).not.toHaveBeenCalled();
    });

    it("should throw error if the tamplate not found", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(null);

      await expect(
        commands.updateTemplateByName(mockTemplate.name, "newName", "newDescription"),
      ).rejects.toThrow("this template not found");

      expect(mockTemplatesRepository.updateTemplateById).not.toHaveBeenCalled();
    });

    it("should throw error if template with this new name already exists", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      mockTemplatesRepository.getTemplateByName
        .mockResolvedValueOnce(mockTemplateWithContainer)
        .mockResolvedValueOnce(mockTemplateWithContainer);

      await expect(
        commands.updateTemplateByName(mockTemplate.name, "newName", "newDescription"),
      ).rejects.toThrow("template with this new name already axists");

      expect(mockTemplatesRepository.updateTemplateById).not.toHaveBeenCalled();
    });

    it("update template", async () => {
      mockTemplatesRepository.getTemplateByName
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockTemplateWithContainer);

      const updatedMockTemplate = {
        name: "newName",
        description: "newDescription",
      } as TemplateModel;

      mockTemplatesRepository.updateTemplateById.mockResolvedValue(updatedMockTemplate);

      const result = await commands.updateTemplateByName(
        mockTemplate.name,
        "newName",
        "newDescription",
      );

      expect(result).toEqual({
        "Old template": {
          createdAt: expect.any(String),
          description: mockTemplate.description,
          container: mockTemplateWithContainer.container.name,
          name: mockTemplate.name,
        },
        "New template": {
          createdAt: expect.any(String),
          description: updatedMockTemplate.description,
          container: mockTemplateWithContainer.container.name,
          name: updatedMockTemplate.name,
        },
      });

      expect(mockTemplatesRepository.updateTemplateById).toHaveBeenCalledWith(
        mockTemplate.id,
        "newName",
        "newDescription",
      );
    });
  });

  describe("Remove template by name", () => {
    it("should throw error if name is empty", async () => {
      await expect(commands.removeTemplateByName("    ")).rejects.toThrow(
        "the name cannot be empty",
      );
    });

    it("should throw error if template not found", async () => {
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(null);

      await expect(commands.removeTemplateByName(mockTemplate.name)).rejects.toThrow(
        "this template not found",
      );
    });

    it("should remove template and return success message", async () => {
      mockTemplatesRepository.getTemplateByName.mockResolvedValue(mockTemplateWithContainer);

      const result = await commands.removeTemplateByName(mockTemplate.name);

      expect(mockTemplatesRepository.removeTemplateByName).toHaveBeenCalledWith(mockTemplate.name);
      expect(result).toEqual("the template has been successfully removed");
    });
  });
});
