import { injectable } from "inversify";
import { TemplateModel } from "../models/template.model.js";
import crypto from "crypto";

@injectable()
export class TemplatesRepository {
  async getTemplateByName(name: string): Promise<TemplateModel | null> {
    const template = await TemplateModel.findOne({
      where: {
        name: name.trim(),
      },
      raw: true,
    });

    return template;
  }

  async createTemplate(
    name: string,
    description: string | null,
    encrypted_data: string,
    salt: string,
    iv: string,
    tag: string,
  ): Promise<TemplateModel> {
    const template = await TemplateModel.create(
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description ? description.trim() : null,
        encrypted_data: encrypted_data,
        salt: salt,
        iv: iv,
        tag: tag,
      },
      { raw: true },
    );

    return template;
  }

  async getAllTemplates(): Promise<TemplateModel[]> {
    const templates = await TemplateModel.findAll({ raw: true });
    return templates;
  }

  async updateTemplateById(
    id: string,
    newName: string,
    newDescription: string | null,
  ): Promise<TemplateModel | null> {
    await TemplateModel.update(
      {
        name: newName.trim(),
        description: newDescription,
      },
      {
        where: {
          id: id,
        },
        returning: true,
      },
    );

    const template = await TemplateModel.findOne({
      where: {
        id: id,
      },
      raw: true,
    });

    return template;
  }

  async removeTemplateByName(name: string) {
    await TemplateModel.destroy({ where: { name: name.trim() } });
  }
}
