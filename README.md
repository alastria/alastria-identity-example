# Example of how to use the Alastria Identity Library

## What it does

This is an example of how to interact with the libraries from [alastria-identity-lib](https://github.com/alastria/alastria-identity-lib). The library alastria-identity-lib re-covers the Smart Contracts from [alastria-identity](https://github.com/alastria/alastria-identity).

### folders of example

|**folder**|**What it does**|
|:--|:--|
|exampleTokens| Contains an example of how to interact with [tokenFactory.ts](https://github.com/alastria/alastria-identity-lib/blob/develop/src/tokenFactory/tokensFactory.ts) functions|
|exampleCredentials| Contains examples of how to create, add and get Credentials in AlastriaID |
|examplePresentations| Contains examples of how to create, add and get Presentations in AlastriaID |
|exampleIdentityServiceProvider| Contains an example of how to add and remove a Identity Service Provider|

## How to use it

First of all, in your working directory init npm with

```sh
npm init -y
```

Then you can consume this library by running:

```sh
npm install --save github:alastria/alastria-identity-lib.git#develop
```

Now, you can use it from any JavaScript file in your working directory.

You can execute some of our examples by running:

```sh
cd example<Credentials, Presentations, Tokens, ServiceProvider>
```

Then you can run the scripts in the correct order markedin each of the scripts

```sh
node 1.<script>
```
