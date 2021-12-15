# Example of how to use the Alastria Identity Library

## What it does

This is an example of how to interact with the libraries from [alastria-identity-lib](https://github.com/alastria/alastria-identity-lib). The library alastria-identity-lib recovers the Smart Contracts from [alastria-identity](https://github.com/alastria/alastria-identity).

**Important**: You need to clone again this repository or update `alastria-identity` **whenever a deploy of new smart contracts is made**. You easily update your repo with:

```sh
# Being in the alastria-identity-example directory
cd node_modules/alastria-identity-lib/alastria-identity
git pull
cd ..
node src/configFile.js
tsc
```

**Important**: Remember that it is necessary to configure alastriaID-truffle-contracts in `:./node_modules/alastria-identity-lib/dist/config.js` with the correct SmartContracts addresses in the case of redT and redB. Examples for that configuration in current directory.

### Folders of example

|**Folder**|**What it does**|**Wiki page**|
|:--|:--|:--|
|exampleCreateAlastriaID| Contains an example of how to create an Alastria ID| [Wiki](https://github.com/alastria/alastria-identity-example/wiki/Create-Alastria-ID-examples) |
|exampleTokens| Contains an example of how to interact with [tokenFactory.ts](https://github.com/alastria/alastria-identity-lib/blob/develop/src/tokenFactory/tokensFactory.ts) functions | [Wiki](https://github.com/alastria/alastria-identity-example/wiki/Tokens-example)|
|exampleCredentials| Contains examples of how to add and get Credentials in AlastriaID | [Wiki](https://github.com/alastria/alastria-identity-example/wiki/Credentials-examples)
|examplePresentations| Contains examples of how to create, add and get Presentations in AlastriaID |[Wiki](https://github.com/alastria/alastria-identity-example/wiki/Presentations-examples)
|exampleIdentityServiceProvider| Contains an example of how to add and remove a Identity Service Provider|[Wiki](https://github.com/alastria/alastria-identity-example/wiki/Service-Provider-examples)
|exampleIdentityIssuer| Contains an example of how to add and remove a Identity Issuer|[Wiki](https://github.com/alastria/alastria-identity-example/wiki/Issuer-examples)
|exampleFirstEntity| Contains an example of how to create the first entity with the firstIdentity account|[Wiki](https://github.com/alastria/alastria-identity-example/wiki/First-Entity-examples)
|exampleEntities| Contains an example of get list of entities and get entity information  |[Wiki](https://github.com/alastria/alastria-identity-example/wiki/Entities-examples)
|exampleAuthentication| It contains an example of how authentication is done  |[Wiki](https://github.com/alastria/alastria-identity-example/wiki/Authentication-example)
|keystores| Contains the mocked keystores that we used to create the identities with different roles. These roles are explained [here](/keystores/README.md)  |



## How to use it

Then you can consume this library by running:

```sh
npm install
```

Now, you can use it from any JavaScript file in your working directory.

You can execute some of our examples by running:

```sh
cd example<FirstEntity, CreateAlastriaID, Credentials, Presentations, ...>
```

Then you can run the scripts in the correct order marked in each of the scripts

```sh
node x.<script>
```

**WARNING**

This is valid only for the Alastria testnet environment. If you are working on another environment, you will need change some parameters in the configuration files:

- Smart Contracts deployed addresses: found in `node_modules/alastria-identity-lib/dist/config.js`
- NodeURL in `configuration.json`
- Have in mind that the only entity that can execute the issuer scripts in the first run is the firstIdentity account. It has to be initialized, though, so you have to execute at least the three first scripts in the folder (exampleFirstEntity)[https://github.com/alastria/alastria-identity-example/tree/master/exampleFirstEntity] before doing anything else.

This is not an extensive list, but a hint of what to look for in case there are errors related to account management in test environments.

## Code linter and formatter

The project uses ESLint as Javascript linter and Prettier as code formatter

We strongly recommend using VSCode as code editor due to the plugins available to install, witch will make us work better and easier

The recommended plugins to use these tools are

- ESLint: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
- Prettier: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

The repository already has configuration files for both, so you won't have to configure anything after the plugins installation

### How to use them?

- ESLint: running `npm run lint` will show any linter errors. Some errors may be automatically fixed if the flag `--fix` is added to the script execution. Also, thanks to the ESLint plugin, VSCode will mark linter errors with red color and warnings with yellow color
- Prettier: with a file open, `cmd+shift+p` (macOS) to open VSCode execution menu, write `Format document with...` and choose Prettier or configure your VSCode workspace to automatically use Prettier if you choose `Format document`: in your VSCode `settings.json` add

```json
"[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
"[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
```

To automatically format Javascript and Typescript code

If you have installed some plugin that add keyboard shortcuts, like IntelliJ IDEA Keybindings (https://marketplace.visualstudio.com/items?itemName=k--kato.intellij-idea-keybindings) you will be able to format documents with Prettier with shortcuts like `cmd+alt+l`
