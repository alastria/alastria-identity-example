# Example of how to use the Alastria Identity Library

## What it does

This is an example of how to interact with the libraries from [alastria-identity-lib](https://github.com/alastria/alastria-identity-lib). The library alastria-identity-lib re-covers the Smart Contracts from [alastria-identity](https://github.com/alastria/alastria-identity).


**Important**: You need to clone again this repository or update `alastria-identity` **whenever a deploy of new smart contracts is made**. You can do it easily with:
```sh
cd node_modules/alastria-identity-lib/alastria-identity
git pull
cd ..
tsc
```

### Folders of example

|**Folder**|**What it does**|
|:--|:--|
|exampleCreateAlastriaID| Contains an example of how to create an Alastria ID
|exampleTokens| Contains an example of how to interact with [tokenFactory.ts](https://github.com/alastria/alastria-identity-lib/blob/develop/src/tokenFactory/tokensFactory.ts) functions|
|exampleCredentials| Contains examples of how to add and get Credentials in AlastriaID |
|examplePresentations| Contains examples of how to create, add and get Presentations in AlastriaID |
|exampleIdentityServiceProvider| Contains an example of how to add and remove a Identity Service Provider|
|exampleIdentityIssuer| Contains an example of how to add and remove a Identity Issuer|
|exampleFirstEntity| Contains an example of how to create the first identity with the admin account|
|keystore| Contains the mocked keystore that we used to create the identities with different roles. These roles are explained in the [README.md](https://github.com/alastria/alastria-identity-example/blob/develop/keystore/README.md) of the keystore folder |

## How to use it

Then you can consume this library by running:

```sh
npm install
```
Now, you can use it from any JavaScript file in your working directory.

You can execute some of our examples by running:

```sh
cd example<AlastriaID, Credentials, Presentations, Tokens, ServiceProvider>
```

Then you can run the scripts in the correct order marked in each of the scripts

```sh
node 1.<script>
```
