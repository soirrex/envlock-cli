import { injectable } from "inversify";
import keytar from "keytar";
import { globalVariables } from "../config/variables.config.js";

@injectable()
export class PasswordRepository {
  async setMasterPassword(password: string) {
    await keytar.setPassword(globalVariables.appName, globalVariables.userName, password);
  }

  async getMasterPassword(): Promise<null | string> {
    const getPassword = await keytar.getPassword(globalVariables.appName, globalVariables.userName);
    return getPassword;
  }

  async removeMasterPassword() {
    await keytar.deletePassword(globalVariables.appName, globalVariables.userName);
  }
}
