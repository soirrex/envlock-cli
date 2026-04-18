import "reflect-metadata";
import { Container } from "inversify";
import { App } from "./app.js";
import { PasswordCommands } from "./commands/password.commands.js";
import { PasswordRepository } from "./repositories/password.repository.js";
import { DBConfig } from "./config/db.config.js";
import { EnvTemplateCommands } from "./commands/template.commands.js";
import { CryptoService } from "./services/crypto.service.js";
import { TemplatesRepository } from "./repositories/template.repository.js";
import { ContainerCommands } from "./commands/container.commands.js";
import { ContainersRepository } from "./repositories/container.repository.js";

export const container = new Container();

container.bind(App).toSelf().inSingletonScope();

container.bind(DBConfig).toSelf().inSingletonScope();

// commands
container.bind(PasswordCommands).toSelf().inSingletonScope();
container.bind(EnvTemplateCommands).toSelf().inSingletonScope();
container.bind(ContainerCommands).toSelf().inSingletonScope();

// repositoryes
container.bind(PasswordRepository).toSelf().inSingletonScope();
container.bind(TemplatesRepository).toSelf().inSingletonScope();
container.bind(ContainersRepository).toSelf().inSingletonScope();

// services
container.bind(CryptoService).toSelf().inSingletonScope();
