<h1 align="center">envlock-cli</h1>

<div align="center">
  <img alt="GitHub License" src="https://img.shields.io/github/license/soirrex/envlock-cli">
  <img alt="NPM Version" src="https://img.shields.io/npm/v/envlock-cli">
  <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/envlock-cli">
</div>

<br>

envlock-cli is a powerful command-line tool for securely managing .env file templates. The application allows you to store configuration templates locally on your computer, protect them with passwords and encryption, and quickly integrate them into new projects, saving time on environment setup. Each template can be protected with a unique password, providing flexible access control for different projects. Thanks to the container system, you can logically isolate templates by project or environment (e.g., frontend, backend, staging), quickly switch between them, and ensure that settings from different projects never get mixed up.

## Example of use

```bash
# 1. Set a master password
el password

# 2. Create a project container (for example, 'shop')
el container shop
el switch shop

# 3. Save the current .env file as a template with a unique password
el save shop_base --file ./.env --description "Shop database .env"

# 4. Restore the template in the new project
el write shop_base ./new-shop/.env --overwrite
```

## Install

#### Manual installation:

```
git clone https://github.com/soirrex/envlock-cli.git
cd ./envlock-cli
npm i
npm run build
npm i -g .
```

#### Install via npm:

```
npm i -g envlock-cli
```

#### Uninstall:

```
npm uni -g envlock-cli
```

## Commands documentation

> If you encounter an error related to a mismatch in database fields, use the following command:

```bash
el dbalter
```

### Commands help

- **Get commands help:**  
  Get help for all commands:

  ```bash
  el -h
  ```

- **Get help for a specific command:**  
  Get help for a specific command:

  ```bash
  el -h <command>
  ```

### Password Management

> The password that will be used for encryption and decryption by default

- **Set password:**  
  Set the password for encryption:

  ```bash
  el password
  ```

- **Remove password:**  
  Remove password:
  ```bash
  el password -r
  ```

### Containers Management

> Use containers to isolate templates from one another, once you select a specific container, all operations on the templates will be performed within that container. By default, the container is set to "null".

- **Create container:**  
  Create a new container:

  ```bash
  el container <name>
  ```

- **Get all containers:**  
  Get all your containers:

  ```bash
  el containers
  ```

- **Switch to another container:**  
  Switch from the current container to another one:

  ```bash
  el switch <containerName>
  ```

- **Update container:**  
  Update container by name:

  ```bash
  el uc <containerName> <newContainerName>
  ```

- **Remove container:**  
  Remove container by name:

  ```bash
  el rmc <containerName>
  ```

### Templates Management

- **Save template:**
  - **Create a new template:**

    ```bash
    el save <name> --description <description>
    ```

  - **Copy the file to the template:**  
    Save the existing file as a template:

    ```bash
    el save <name> --file <path> --description <description>
    ```

  If you want to use a different password for encryption, you can specify it with the `--password` option.

- **Get templates:**
  - **Get all templates:**  
    Get a list of all templates:

    ```bash
    el get
    ```

    If you want to get all templates from all containers, you can specify it with the `--containers` option.

  - **Get a template by name:**  
    Get a specific template:

    ```bash
    el get --name <name>
    ```

    If you want to use a different password for decryption, you can specify it with the `--password` option.

- **Update template by name:**
  - **Update template data by name:**

    ```bash
    el update <name> --name <newName> --description <newDescription>
    ```

  - **Update template content:**  
    Update the encrypted data in the template:

    ```bash
    el update <name> --content
    ```

    If you want to use a different password for decryption, you can specify it with the `--password` option.

  > You cannot use all flags in a command at the same time, if you use `el update <name> --name <newName> --description <newDescriptio> --content`, the `--content` flag will always take precedence when all flags are used together, and the other flags will be ignored

- **Save the template to a file:**  
  Save the template to the specified file:
  - **Add the following template to the end of the file:**

    ```bash
    el write <name> <path>
    ```

  - **Overwrite the file with the template:**
    ```bash
    el write <name> <path> --overwrite
    ```

  If you want to use a different password for decryption, you can specify it with the `--password` option.

- **Move template to another container:**  
  Move template to another container:

  ```bash
  el move <templateName> <containerName>
  ```

- **Remove template:**  
  Remove a specific template:
  ```bash
  el remove <name>
  ```
