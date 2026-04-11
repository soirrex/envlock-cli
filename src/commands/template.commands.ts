import inquirer from "inquirer";
import { inject, injectable } from "inversify";
import { PasswordRepository } from "../repositories/password.repository.js";
import { CryptoService } from "../services/crypto.service.js";
import { TemplatesRepository } from "../repositories/template.repository.js";
import fs from "fs";
import path from "path";

interface IGetTemplate {
  name: string;
  description: string | null;
  createdAt: string;
}

@injectable()
export class EnvTemplateCommands {
  constructor(
    @inject(PasswordRepository) private readonly passwordRepository: PasswordRepository,
    @inject(CryptoService) private readonly cryptoService: CryptoService,
    @inject(TemplatesRepository) private readonly templatesRepository: TemplatesRepository,
  ) {}

  async saveTemplate(name: string, description?: string, file?: string): Promise<string> {
    if (name.trim().length < 1) {
      throw new Error("the name cannot be empty");
    } else if (name.trim().length > 50) {
      throw new Error("the name is too long, max 50 characters");
    } else if (description && description.trim().length > 200) {
      throw new Error("the description is too long, max 200 characters");
    }

    const password = await this.checkMasterPassword();

    const findTemplate = await this.templatesRepository.getTemplateByName(name);
    if (findTemplate) {
      throw new Error("this name already exists");
    }

    let templateData: string;

    if (file) {
      const filePath = this.checkFileExists(file);
      templateData = fs.readFileSync(filePath, "utf8");
    } else {
      const answers = await inquirer.prompt([
        { name: "template", type: "editor", message: "Enter your .env template" },
      ]);

      templateData = answers.template;
    }

    if (!templateData || templateData.length < 1) {
      throw new Error("the template cannot be empty, please enter the .env template");
    }

    const encrypted = this.cryptoService.encrypt(password, templateData);

    await this.templatesRepository.createTemplate(
      name,
      description ? description : null,
      encrypted.encrypted_data,
      encrypted.salt,
      encrypted.iv,
      encrypted.tag,
    );

    return "the template has been successfully saved";
  }

  async getAllTemplates(): Promise<Record<string, IGetTemplate>> {
    await this.checkMasterPassword();

    const templates = await this.templatesRepository.getAllTemplates();
    const result: Record<string, IGetTemplate> = {};

    for (let i = 0; i < templates.length; i++) {
      result[`template ${i + 1}`] = {
        name: templates[i]!.name,
        description: templates[i]!.description,
        createdAt: new Date(templates[i]!.createdAt).toLocaleString(),
      };
    }

    return result;
  }

  async getTemplateByName(name: string): Promise<string> {
    if (name.trim().length < 1) {
      throw new Error("the name cannot be empty");
    }

    const password = await this.checkMasterPassword();
    const template = await this.templatesRepository.getTemplateByName(name);

    if (!template) {
      throw new Error("this template not found");
    }

    const decrypted = this.cryptoService.decrypt(
      password,
      template.encrypted_data,
      template.salt,
      template.iv,
      template.tag,
    );

    return "\n" + decrypted;
  }

  async writeTemplateToFile(name: string, file: string, overwrite?: boolean): Promise<string> {
    if (name.trim().length < 1) {
      throw new Error("the name cannot be empty");
    }

    const password = await this.checkMasterPassword();

    const filePath = this.checkFileExists(file);

    const template = await this.templatesRepository.getTemplateByName(name);

    if (!template) {
      throw new Error("this template not found");
    }

    const decrypted = this.cryptoService.decrypt(
      password,
      template.encrypted_data,
      template.salt,
      template.iv,
      template.tag,
    );

    if (overwrite) {
      fs.writeFileSync(filePath, decrypted, "utf8");
    } else {
      fs.appendFileSync(filePath, "\n" + decrypted, "utf8");
    }

    return "the template has been successfully written to the file";
  }

  async updateTemplateByName(
    name: string,
    newName?: string,
    newDescription?: string,
  ): Promise<Record<string, IGetTemplate>> {
    if (name.trim().length < 1) {
      throw new Error("the name cannot be empty");
    }

    if (!newName && !newDescription) {
      throw new Error("you must update at least one thing");
    }

    if (newName && newName.trim().length < 1) {
      throw new Error("the name cannot be empty");
    } else if (newName && newName.trim().length > 50) {
      throw new Error("the name is too long, max 50 characters");
    }

    if (newDescription && newDescription.trim().length > 200) {
      throw new Error("the description is too long, max 200 characters");
    }

    await this.checkMasterPassword();

    const template = await this.templatesRepository.getTemplateByName(name);

    if (!template) {
      throw new Error("this template not found");
    }

    const newTemplate = await this.templatesRepository.updateTemplateById(
      template.id,
      newName ? newName : template.name,
      newDescription ? newDescription : template.description,
    );

    if (!newTemplate) {
      throw new Error("this template not found");
    }

    return {
      "Old template": {
        name: template.name,
        description: template.description,
        createdAt: new Date(template.createdAt).toLocaleString(),
      },
      "New template": {
        name: newTemplate.name,
        description: newTemplate.description,
        createdAt: new Date(template.createdAt).toLocaleString(),
      },
    };
  }

  async removeTemplateByName(name: string): Promise<string> {
    if (name.trim().length < 1) {
      throw new Error("the name cannot be empty");
    }

    await this.checkMasterPassword();

    const template = await this.templatesRepository.getTemplateByName(name);
    if (!template) {
      throw new Error("this template not found");
    }

    await this.templatesRepository.removeTemplateByName(name);

    return "the template has been successfully removed";
  }

  private async checkMasterPassword(): Promise<string> {
    const password = await this.passwordRepository.getMasterPassword();
    if (!password) {
      throw new Error("you don't have a master password");
    }

    return password;
  }

  private checkFileExists(file: string): string {
    const currentDir = process.cwd();
    const filePath = path.join(currentDir, file);

    if (!fs.existsSync(filePath)) {
      throw new Error("the file not found");
    }

    return filePath;
  }
}
