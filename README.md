# Example of how to use the Alastria Identity Library
## What it does
This is an example of how to interact with the libraries from [alastria-identity-lib](https://github.com/alastria/alastria-identity-lib). The library alastria-identity-lib re-covers the Smart Contracts from [alastria-identity](https://github.com/alastria/alastria-identity).

### Files of example 
|**File**|**What it does**|
|:--:|:--|
|exampleTokensFactory.js| Contains examples of how to interact with [tokenFactory.ts](https://github.com/alastria/alastria-identity-lib/blob/develop/src/tokenFactory/tokensFactory.ts) functions|
|exampleCreateAlastriaID.js| Contains a example of how to create an Alastria ID |
|exampleAddSubjectCredential.js| Contains an example of how to give a subject a credential and how to verify the status of that credential |
|exampleIdentityServiceProvider.js	| Contains an example of how to add and remove a Identity Service Provider|
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
node file_name.js 
```

