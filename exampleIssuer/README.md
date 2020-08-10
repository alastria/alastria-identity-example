# Important

In this folder we have four files:

1. addEntity ([`exampleIssuer/1.addEntity.js`](1.addEntity.js))
2. addIdentityIssuer ([`exampleIssuer/2.addIdentityIssuer.js`](2.addIdentityIssuer.js))
3. deleteIdentityIssuer ([`exampleIssuer/3.deleteIdentityIssuer.js`](3.deleteIdentityIssuer.js)).
4. isIdentityIssuer([`exampleIssuer/3.isIdentityIssuer.js`](4.isServiceProvider.js)).

You must execute first the script `1.addEntity.js`, and then `2.addIdentityIssuer`.

You can execute script `4.isIdentityIssuer` if you want to know that the entity is a Issuer or not.

Also, you can execute the script `3.deleteIdentityIssuer.js` if you want to remove that entity as a Issuer role.

## Error cases

The following cases will return an error (`Transaction has been reverted by the EVM`)

1. Create an issuer identity that already exists
2. Try to delete an issuer identity that doesn't exists
