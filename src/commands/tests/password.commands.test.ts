/* eslint @typescript-eslint/no-explicit-any: "off" */

import { PasswordRepository } from "../../repositories/password.repository.js";
import { PasswordCommands } from "../password.commands.js";
import { jest } from "@jest/globals";
import inquirer from "inquirer";

describe("Password commands test", () => {
  let commands: PasswordCommands;
  let mockPasswordRepository: jest.Mocked<PasswordRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPasswordRepository = {
      getMasterPassword: jest.fn(),
      setMasterPassword: jest.fn(),
      removeMasterPassword: jest.fn(),
    } as unknown as jest.Mocked<PasswordRepository>;

    commands = new PasswordCommands(mockPasswordRepository as PasswordRepository);
  });

  describe("Set password", () => {
    it("should throw error if password is empty", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue(null);

      jest.spyOn(inquirer, "prompt" as any).mockResolvedValue({ password: "" });
      await expect(commands.setMasterPassword()).rejects.toThrow(
        "the password cannot be empty, please enter a valid master password",
      );

      expect(mockPasswordRepository.setMasterPassword).not.toHaveBeenCalled();
    });

    it("should throw error if the passwords don't match", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue(null);

      jest
        .spyOn(inquirer, "prompt" as any)
        .mockResolvedValue({ password: "password", confirmPassword: "password2" });

      await expect(commands.setMasterPassword()).rejects.toThrow("the passwords don't match");
      expect(mockPasswordRepository.setMasterPassword).not.toHaveBeenCalled();
    });

    it("cancel the process if the user has a password and has canceled the overwrite", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");

      jest.spyOn(inquirer, "prompt" as any).mockResolvedValue({ overwrite: false });

      const result = await commands.setMasterPassword();
      expect(result).toEqual("cancel");
    });

    it("overwrite the password if the user confirms the overwrite", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");

      jest
        .spyOn(inquirer, "prompt" as any)
        .mockResolvedValue({ overwrite: true, password: "password", confirmPassword: "password" });

      const result = await commands.setMasterPassword();
      expect(result).toEqual("the password has been set successfully");
      expect(mockPasswordRepository.setMasterPassword).toHaveBeenCalledWith("password");
    });
  });

  describe("Remove password", () => {
    it("should throw error if user don't have a password", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue(null);
      await expect(commands.removeMasterPassword()).rejects.toThrow(
        "you don't have a master password",
      );
    });

    it("cancel password deletion if the user has not confirmed", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      jest.spyOn(inquirer, "prompt" as any).mockResolvedValue({ remove: false });

      const result = await commands.removeMasterPassword();
      expect(result).toEqual("cancel");
      expect(mockPasswordRepository.removeMasterPassword).not.toHaveBeenCalled();
    });

    it("should remove password", async () => {
      mockPasswordRepository.getMasterPassword.mockResolvedValue("password");
      jest.spyOn(inquirer, "prompt" as any).mockResolvedValue({ remove: true });

      const result = await commands.removeMasterPassword();
      expect(result).toEqual("the password has been successfully removed");
      expect(mockPasswordRepository.removeMasterPassword).toHaveBeenCalledWith();
    });
  });
});
