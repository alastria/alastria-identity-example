# Example of how to use the Alastria Identity Library
## What it does
This is an example of how to interact with the libraries from [alastria-identity-lib](https://github.com/alastria/alastria-identity-lib).

Also alastria-identity-lib interacts with the Smart Contracts from [alastria-identity](https://github.com/alastria/alastria-identity).

### Files of example 
|**File**|**What it does**|
|:--:|:--|
|exampleTokensFactory.js| Contains examples of how to interact with [tokenFactory.ts](https://github.com/alastria/alastria-identity-lib/blob/develop/src/tokenFactory/tokensFactory.ts) functions|
|exampleCreateAlastriaID.js| Contains a example of how to create an Alastria ID |
## How to use it
First of all, in your working directory init npm with
```
npm init -y
```
Then you can consume this library by running:
```
npm install --save github:alastria/alastria-identity-lib.git#develop
```
Now, you can use it from any JavaScript file in your working directory.

In this moment, you can execute 
`node exampleTokensFactory.js` or `node exampleCreateAlastriaID.js `. 

