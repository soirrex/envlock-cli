<h1 align="center">envlock-cli</h1>

<div align="center">
  <img alt="GitHub License" src="https://img.shields.io/github/license/soirrex/envlock-cli">
  <img alt="NPM Version" src="https://img.shields.io/npm/v/envlock-cli">
  <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/envlock-cli">
</div>

<br>

envlock-cli is a command-line application (CLI) designed for securely managing .env file templates. envlock-cli allows you to store templates locally on your computer, protect them with a master password, and quickly integrate them into projects

## Install

### Manual installation:

```
git clone https://github.com/soirrex/envlock-cli.git
cd ./envlock-cli
npm i
npm run build
npm i -g .
```

### Install via npm:

```
npm i -g envlock-cli
```

### Uninstall:

```
npm uni -g envlock-cli
```

## Usage

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

- **Remove container:**  
  Remove container by name:

  ```bash
  el rmc <containerName>
  ```

### Templates Management

- **Save template:**  
  Create a new template:

  ```bash
  el save <name> --description <description>
  ```

  If you want to use a different password for encryption, you can specify it with the `--password` option.

- **Copy the file to the template:**  
  Save the existing file as a template:

  ```bash
  el save <name> --file <path> --description <description>
  ```

  If you want to use a different password for encryption, you can specify it with the `--password` option.

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
  Update template by name:

  ```bash
  el update <name> --name <newName> --description <newDescription>
  ```

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
