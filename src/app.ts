import { inject, injectable } from "inversify";
import { Command } from "commander";
import fs from "fs";
import { PasswordCommands } from "./commands/password.commands.js";
import { globalVariables } from "./config/variables.config.js";
import { DBConfig } from "./config/db.config.js";
import { EnvTemplateCommands } from "./commands/template.commands.js";

@injectable()
export class App {
  private program = new Command();

  constructor(
    @inject(DBConfig) private readonly dbConfig: DBConfig,
    @inject(PasswordCommands) private readonly passwordCommands: PasswordCommands,
    @inject(EnvTemplateCommands) private readonly envTemplateCommands: EnvTemplateCommands,
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
      .action(async (name, options) => {
        try {
          const message = await this.envTemplateCommands.saveTemplate(
            name,
            options.description,
            options.file,
          );
          console.log(message);
        } catch (err: unknown) {
          this.handleError(err);
        }
      });

    this.program
      .command("get")
      .description("Get templates")
      .option("-n, --name <name>", "get template by name")
      .action(async (options) => {
        try {
          if (options.name) {
            const message = await this.envTemplateCommands.getTemplateByName(options.name);
            console.log(message);
          } else {
            const message = await this.envTemplateCommands.getAllTemplates();
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
      .action(async (name, path, options) => {
        try {
          const message = await this.envTemplateCommands.writeTemplateToFile(
            name,
            path,
            options.overwrite,
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
      .option("-n, --name <name>", "new name for the template")
      .option("-d, --description <description>", "new description for the template")
      .action(async (name, options) => {
        try {
          const message = await this.envTemplateCommands.updateTemplateByName(
            name,
            options.name,
            options.description,
          );
          console.table(message);
        } catch (err: unknown) {
          this.handleError(err);
        }
      });
  }

  private createHomeDir() {
    fs.mkdirSync(globalVariables.appDir, { recursive: true, mode: 0o700 });
  }

  start() {
    this.program.name("el").version("1.0.2");

    this.registerCommands();
    this.createHomeDir();

    this.dbConfig.connect();

    this.program.parse();
  }
}
