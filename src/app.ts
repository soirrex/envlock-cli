import { inject, injectable } from "inversify";
import { Command } from "commander";
import fs from "fs";
import { PasswordCommands } from "./commands/password.commands.js";
import { globalVariables } from "./config/variables.config.js";
import { DBConfig } from "./config/db.config.js";
import { EnvTemplateCommands } from "./commands/template.commands.js";
import { ContainerCommands } from "./commands/container.commands.js";

@injectable()
export class App {
  private program = new Command();

  constructor(
    @inject(DBConfig) private readonly dbConfig: DBConfig,
    @inject(PasswordCommands) private readonly passwordCommands: PasswordCommands,
    @inject(EnvTemplateCommands) private readonly envTemplateCommands: EnvTemplateCommands,
    @inject(ContainerCommands) private readonly containerCommands: ContainerCommands,
  ) {}

  private handleError(error: unknown) {
    if (error instanceof Error) {
      console.error(`error: ${error.message}`);
    } else {
      console.error("unknown error occurred");
    }
  }

  private registerCommands() {
    this.program
      .command("password")
      .description("Set or remove a master password to encrypt your data")
      .option("-r, --remove", "remove mester password")
      .action(async (options) => {
        try {
          let message: string;
          if (options.remove) {
            message = await this.passwordCommands.removeMasterPassword();
          } else {
            message = await this.passwordCommands.setMasterPassword();
          }
          console.log(message);
        } catch (err: unknown) {
          this.handleError(err);
        }
      });

    this.program
      .command("save")
      .description("Create a new encrypted .env template")
      .argument("<name>", "Template name")
      .option("-d, --description <description>", "Description for template")
      .option("-f, --file <path>", "Copy file to template")
      .option("-p, --password", "Use a different password (not a master)")
      .action(async (name, options) => {
        try {
          const message = await this.envTemplateCommands.saveTemplate(
            name,
            options.description,
            options.file,
            options.password,
          );
          console.log(message);
        } catch (err: unknown) {
          this.handleError(err);
        }
      });

    this.program
      .command("get")
      .description("Get templates")
      .option("-c, --containers", "get all templates from all containers")
      .option("-n, --name <name>", "get template by name")
      .option("-p, --password", "Use a different password (not a master)")
      .action(async (options) => {
        try {
          if (options.name) {
            const message = await this.envTemplateCommands.getTemplateByName(
              options.name,
              options.password,
            );
            console.log(message);
          } else {
            const message = await this.envTemplateCommands.getAllTemplates(options.containers);
            console.table(message);
          }
        } catch (err: unknown) {
          this.handleError(err);
        }
      });

    this.program
      .command("write")
      .description("Write a template to a file")
      .argument("<name>", "Template name")
      .argument("<path>", "File path")
      .option("-o, --overwrite", "overwrite the file with the template")
      .option("-p, --password", "Use a different password (not a master)")
      .action(async (name, path, options) => {
        try {
          const message = await this.envTemplateCommands.writeTemplateToFile(
            name,
            path,
            options.overwrite,
            options.password,
          );
          console.log(message);
        } catch (err: unknown) {
          this.handleError(err);
        }
      });

    this.program
      .command("remove")
      .description("Remove template")
      .argument("<name>", "Template name")
      .action(async (name) => {
        try {
          const message = await this.envTemplateCommands.removeTemplateByName(name);
          console.log(message);
        } catch (err: unknown) {
          this.handleError(err);
        }
      });

    this.program
      .command("update")
      .description("Update template")
      .argument("<name>", "Template name")
      .option("-n, --name <name>", "New name for the template")
      .option("-d, --description <description>", "New description for the template")
      .option("-c, --content", "Update the encrypted data in the template")
      .option("-p, --password", "Use a different password (not a master)")
      .action(async (name, options) => {
        try {
          let message;
          if (options.content) {
            message = await this.envTemplateCommands.updateTemplateContentByName(
              name,
              options.password,
            );
          } else {
            message = await this.envTemplateCommands.updateTemplateByName(
              name,
              options.name,
              options.description,
            );
          }
          console.table(message);
        } catch (err: unknown) {
          this.handleError(err);
        }
      });

    this.program
      .command("container")
      .description("Create container and assign templates to it")
      .argument("<name>", "Container name")
      .action(async (name) => {
        try {
          const message = await this.containerCommands.createContainer(name);
          console.log(message);
        } catch (err: unknown) {
          this.handleError(err);
        }
      });

    this.program
      .command("containers")
      .description("Get all containers")
      .action(async () => {
        try {
          const message = await this.containerCommands.getAllContainers();
          console.table(message);
        } catch (err: unknown) {
          this.handleError(err);
        }
      });

    this.program
      .command("rmc")
      .description("Remove container")
      .argument("<containerName>", "Container name")
      .action(async (containerName) => {
        try {
          const message = await this.containerCommands.removeContainer(containerName);
          console.log(message);
        } catch (err: unknown) {
          this.handleError(err);
        }
      });

    this.program
      .command("uc")
      .description("Update container")
      .argument("<containerName>", "Container name")
      .argument("<newName>", "New container name")
      .action(async (containerName, newName) => {
        try {
          const message = await this.containerCommands.updateContainer(containerName, newName);
          console.log(message);
        } catch (err: unknown) {
          this.handleError(err);
        }
      });

    this.program
      .command("switch")
      .description("Switch to another container")
      .argument("<containerName>", "Container name")
      .action(async (containerName) => {
        try {
          const message = await this.containerCommands.switchToAnotherContainer(containerName);
          console.log(message);
        } catch (err: unknown) {
          this.handleError(err);
        }
      });

    this.program
      .command("move")
      .description("Move template to another container")
      .argument("<templateName>", "template name")
      .argument("<containerName>", "container name")
      .action(async (templateName, containerName) => {
        try {
          const message = await this.envTemplateCommands.moveTemplateToAnotherContainer(
            templateName,
            containerName,
          );
          console.log(message);
        } catch (err: unknown) {
          this.handleError(err);
        }
      });

    this.program
      .command("dbalter")
      .description("Use the ALTER command for the database")
      .action(async () => {
        try {
          await this.dbConfig.alter();
          console.log("successfully");
        } catch (err: unknown) {
          this.handleError(err);
        }
      });
  }

  private createHomeDir() {
    fs.mkdirSync(globalVariables.appDir, { recursive: true, mode: 0o700 });

    if (!fs.existsSync(globalVariables.configPath)) {
      fs.writeFileSync(
        globalVariables.configPath,
        JSON.stringify({ currentContainer: null }, null, 2),
      );
    }
  }

  start() {
    this.program
      .name("el")
      .version("1.0.7")
      .description(
        "envlock-cli is a secure command-line interface for managing encrypted .env templates. Store configurations locally, protect each template with a unique password, and group them into containers (frontend, backend, staging). It’s ideal for securely setting up environments and protecting sensitive data during the development process.",
      );

    this.registerCommands();
    this.createHomeDir();

    this.dbConfig.connect();

    this.program.parse();
  }
}
