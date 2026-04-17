/* eslint @typescript-eslint/no-explicit-any: "off" */
import crypto from "crypto";
import { CryptoService } from "../crypto.service.js";

describe("Crypto service test", () => {
  let service: CryptoService;

  beforeEach(() => {
    service = new CryptoService();
  });

  describe("Encrypt", () => {
    it("should throw an error if the password is empty", () => {
      expect(() => {
        service.encrypt("", "data");
      }).toThrow("the password cannot be empty, please enter a valid master password");
    });

    it("should throw an error if the data is empty", () => {
      expect(() => {
        service.encrypt("password", "");
      }).toThrow("the data cannot be empty, please enter a valid data to encrypt");
    });

    it("should encrypt the data", () => {
      const result = service.encrypt("password", "data");

      expect(result).toEqual({
        tag: expect.any(String),
        encrypted_data: expect.any(String),
        salt: expect.any(String),
        iv: expect.any(String),
      });
    });
  });

  describe("Decrypt", () => {
    it("should throw an error if the password or tag is invalid", () => {
      const { tag, encrypted_data, salt, iv } = service.encrypt("password", "data");

      expect(() => {
        service.decrypt("wrong_password", encrypted_data, salt, iv, tag);
      }).toThrow(
        "Unable to decrypt the data: the data may be corrupted, or the master password may be incorrect",
      );

      expect(() => {
        service.decrypt("password", encrypted_data, salt, iv, "wrong_tag");
      }).toThrow("Invalid authentication tag length: 6");

      expect(() => {
        service.decrypt(
          "password",
          encrypted_data,
          salt,
          iv,
          crypto.randomBytes(16).toString("base64"),
        );
      }).toThrow(
        "Unable to decrypt the data: the data may be corrupted, or the master password may be incorrect",
      );
    });

    it("should decrypt the data", () => {
      const { tag, encrypted_data, salt, iv } = service.encrypt("password", "data");

      const decrypted = service.decrypt("password", encrypted_data, salt, iv, tag);
      expect(decrypted).toEqual("data");
    });
  });
});
