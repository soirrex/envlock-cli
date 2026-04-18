/* eslint @typescript-eslint/no-explicit-any: "off" */

jest.mock("keytar", () => ({
  setPassword: jest.fn(),
  getPassword: jest.fn(),
  deletePassword: jest.fn(),
}));

import keytar from "keytar";
import { PasswordRepository } from "../password.repository.js";
import { globalVariables } from "../../config/variables.config.js";
import { jest } from "@jest/globals";

describe("Password repository", () => {
  const repo = new PasswordRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Set password", () => {
    it("should call keytar.setPassword with valid args", async () => {
      const setSpy = jest.spyOn(keytar as any, "setPassword").mockResolvedValue(undefined);

      await repo.setMasterPassword("secret");
      expect(setSpy).toHaveBeenCalledWith(
        globalVariables.appName,
        globalVariables.userName,
        "secret",
      );
    });

    it("should throw error when keytar.setPassword rejects", async () => {
      const err = new Error("fail");
      jest.spyOn(keytar as any, "setPassword").mockRejectedValue(err);
      await expect(repo.setMasterPassword("pw")).rejects.toThrow("fail");
    });
  });

  describe("Get password", () => {
    it("should return stored password", async () => {
      const getSpy = jest.spyOn(keytar as any, "getPassword").mockResolvedValue("stored");

      const result = await repo.getMasterPassword();

      expect(result).toEqual("stored");
      expect(getSpy).toHaveBeenCalledWith(globalVariables.appName, globalVariables.userName);
    });

    it("should return null when none", async () => {
      const getSpy = jest.spyOn(keytar as any, "getPassword").mockResolvedValue(null);

      const result = await repo.getMasterPassword();

      expect(result).toEqual(null);
      expect(getSpy).toHaveBeenCalledWith(globalVariables.appName, globalVariables.userName);
    });

    it("should throw error when getPassword rejects", async () => {
      const err = new Error("fail");
      jest.spyOn(keytar as any, "getPassword").mockRejectedValue(err);
      await expect(repo.getMasterPassword()).rejects.toThrow("fail");
    });
  });

  describe("removeMasterPassword", () => {
    it("should call keytar.deletePassword with valid args", async () => {
      const delSpy = jest.spyOn(keytar as any, "deletePassword").mockResolvedValue(true);
      await repo.removeMasterPassword();
      expect(delSpy).toHaveBeenCalledWith(globalVariables.appName, globalVariables.userName);
    });

    it("should throw error keytar.deletePassword reject", async () => {
      const err = new Error("fail");
      jest.spyOn(keytar as any, "deletePassword").mockRejectedValue(err);
      await expect(repo.removeMasterPassword()).rejects.toThrow("fail");
    });
  });
});
