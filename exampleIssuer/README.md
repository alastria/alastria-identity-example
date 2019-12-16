# Important
In this folder we have two files, one of addIdentityIssuer ([`exampleIssuer/1.identityIssuer.js`](1.identityIssuer.js)) and the other of deleteIdentityServiceProvider ([`exampleIssuer/2.deleteIdentityIssuer.js`](2.deleteIdentityIssuer.js)).

## Error cases
The following cases will return an error (`Transaction has been reverted by the EVM`)
1. Create an issuer identity that already exists
2. Try to delete an issuer identity that doesn't exists


