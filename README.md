# envlock-cli

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

### Master Password Management

- **Set master password:**  
  Set the master password for encryption:

  ```bash
  el password
  ```

- **Remove master password:**  
  Remove master password:
  ```bash
  el password -r
  ```

### Template Management

- **Save template:**  
   Create a new template:

  ```bash
  el save <name> --description <description>
  ```

- **Copy the file to the template:**  
  Save the existing file as a template:

  ```bash
  el save <name> --file <path> --description <description>
  ```

- **Get all templates:**  
  Get a list of all templates:

  ```bash
  el get
  ```

- **Get a template by name:**  
  Get a specific template:

  ```bash
  el get --name <name>
  ```

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

- **Remove template:**  
  Remove a specific template:
  ```bash
  el remove <name>
  ```
