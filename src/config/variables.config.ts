import path from "path";
import os from "os";

export const globalVariables = {
  appDir: path.join(os.homedir(), ".envlock-cli"),
  configPath: path.join(os.homedir(), ".envlock-cli", "config.json"),
  appName: "envlock-cli",
  userName: os.userInfo().username,
};
