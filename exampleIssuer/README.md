# Important
In this folder we have two files, one of addIdentityIssuer ([`exampleServiceProvider/1.identityIssuer.js`](https://github.com/alastria/alastria-identity-example/blob/develop/exampleServiceProvider/1.identityIssuer.js)) and the other of deleteIdentityServiceProvider ([`exampleServiceProvider/2.deleteIdentityIssuer.js`](https://github.com/alastria/alastria-identity-example/blob/develop/exampleServiceProvider/2.deleteIdentityIssuer.js)).

## Error cases
The following cases will return an error (`Transaction has been reverted by the EVM`)
1. Create an issuer identity that already exists
2. Try to delete an issuer identity that doesn't exists


