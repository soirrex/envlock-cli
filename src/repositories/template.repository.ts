import { inject, injectable } from "inversify";
import { TemplateModel } from "../models/template.model.js";
import crypto from "crypto";
import { ContainerModel } from "../models/container.model.js";
import { ContainersRepository } from "./container.repository.js";

@injectable()
export class TemplatesRepository {
  constructor(@inject(ContainersRepository) private containersRepository: ContainersRepository) {}

  async getTemplateByName(
    name: string,
  ): Promise<(TemplateModel & { container: ContainerModel }) | null> {
    const template = await TemplateModel.findOne({
      where: {
        name: name.trim(),
      },
      raw: true,
    });

    return template as (TemplateModel & { container: ContainerModel }) | null;
  }

  async createTemplate(
    name: string,
    description: string | null,
    encrypted_data: string,
    salt: string,
    iv: string,
    tag: string,
  ): Promise<TemplateModel> {
    const currentContainer = await this.containersRepository.getCurrentContainer();

    const template = await TemplateModel.create(
      {
        id: crypto.randomUUID(),
        containerId: currentContainer ? currentContainer.id : null,
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

  async getAllTemplates(
    ignoreCurrentContainer?: boolean,
  ): Promise<Array<TemplateModel & { container: ContainerModel }>> {
    let templates;

    if (ignoreCurrentContainer) {
      templates = await TemplateModel.findAll({
        include: [
          {
            model: ContainerModel,
            as: "container",
          },
        ],
        raw: true,
        nest: true,
      });
    } else {
      const currentContainer = await this.containersRepository.getCurrentContainer();
      templates = await TemplateModel.findAll({
        where: {
          containerId: currentContainer ? currentContainer.id : null,
        },
        include: [
          {
            model: ContainerModel,
            as: "container",
          },
        ],
        raw: true,
        nest: true,
      });
    }

    return templates as Array<TemplateModel & { container: ContainerModel }>;
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
