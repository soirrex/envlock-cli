import { injectable } from "inversify";
import crypto from "crypto";

@injectable()
export class CryptoService {
  encrypt(
    password: string,
    data: string,
  ): { tag: string; encrypted_data: string; salt: string; iv: string } {
    if (!password || password.length < 1) {
      throw new Error("the password cannot be empty, please enter a valid master password");
    } else if (!data || data.length < 1) {
      throw new Error("the data cannot be empty, please enter a valid data to encrypt");
    }

    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(16);
    const key = this.generateKey(password, salt);

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = cipher.update(data, "utf8", "base64") + cipher.final("base64");
    const authTag = cipher.getAuthTag().toString("base64");

    return {
      tag: authTag,
      encrypted_data: encrypted,
      salt: salt.toString("base64"),
      iv: iv.toString("base64"),
    };
  }

  decrypt(password: string, encrypted_data: string, salt: string, iv: string, tag: string): string {
    if (!password || password.length < 1) {
      throw new Error("the password cannot be empty, please enter a valid master password");
    }

    const key = this.generateKey(password, Buffer.from(salt, "base64"));

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));

    let decrypted;

    try {
      decrypted = decipher.update(encrypted_data, "base64", "utf8") + decipher.final("utf8");
    } catch {
      throw new Error(
        "Unable to decrypt the data: the data may be corrupted, or the master password may be incorrect",
      );
    }

    return decrypted;
  }

  private generateKey(password: string, salt: Buffer): Buffer {
    const iter = 1000000;
    const keyLength = 32;

    const key = crypto.pbkdf2Sync(password, salt, iter, keyLength, "sha256");
    return key;
  }
}
