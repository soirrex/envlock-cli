import inquirer from "inquirer";
import { inject, injectable } from "inversify";
import { PasswordRepository } from "../repositories/password.repository.js";

@injectable()
export class PasswordCommands {
  constructor(
    @inject(PasswordRepository) private readonly passwordRepository: PasswordRepository,
  ) {}

  async setMasterPassword(): Promise<string> {
    const password = await this.passwordRepository.getMasterPassword();
    if (password) {
      const questions = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: "You already have a master password. Would you like to overwrite it?",
          default: false,
        },
      ]);

      if (!questions.overwrite) {
        return "cancel";
      }
    }

    const answers = await inquirer.prompt([
      { name: "password", type: "password", message: "Enter your master password:", mask: "*" },
      { name: "confirmPassword", type: "password", message: "Confirm master password:", mask: "*" },
    ]);

    if (!answers.password || answers.password.length < 1) {
      throw new Error("the password cannot be empty, please enter a valid master password");
    } else if (answers.password !== answers.confirmPassword) {
      throw new Error("the passwords don't match");
    }

    this.passwordRepository.setMasterPassword(answers.password);
    return "the password has been set successfully";
  }

  async removeMasterPassword(): Promise<string> {
    const password = await this.passwordRepository.getMasterPassword();
    if (!password) {
      throw new Error("you don't have a master password");
    }

    const questions = await inquirer.prompt([
      {
        type: "confirm",
        name: "remove",
        message: "Do you want to remove the master password?",
        default: false,
      },
    ]);

    if (!questions.remove) {
      return "cancel";
    } else {
      this.passwordRepository.removeMasterPassword();
      return "the password has been successfully removed";
    }
  }
}
