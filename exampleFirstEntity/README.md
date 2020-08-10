# Important

You must be executed the following examples in order to create the first entity.

1. createEntityAlastriaID ([`exampleFirstEntity/1.createEntityAlastriaID.js`](1.createEntityAlastriaID.js))
2. addEntity ([`exampleFirstEntity/2.addEntity.js`](2.addEntity.js))
3. addIdentityIssuer ([`exampleFirstEntity/3.addIdentityIssuer.js`](3.addIdentityIssuer.js))
4. addIdentityServiceProvider ([`exampleFirstEntity/4.addIdentityServiceProvider.js`](4.addIdentityServiceProvider.js))
5. deleteIdentityIssuer.js ([`exampleFirstEntity/5.deleteIdentityIssuer.js`](5.deleteIdentityIssuer.js))
6. deleteIdentityServiceProvider ([`exampleFirstEntity/6.deleteIdentityServiceProvider.js`](6.deleteIdentityServiceProvider.js))
7. isIdentityIssuer ([`exampleFirstEntity/7.isIdentityIssuer.js`](7.isIdentityIssuer.js))
8. isIdentityServiceProvider ([`exampleFirstEntity/8.isIdentityServiceProvider.js`](8.isIdentityServiceProvider.js))

Only if you want to remove the entity from being a Service provider or Issuer, you must execute the examples 5 and/or 6.

If you want to check that the entity is Service Provider or Issuer in any moment execute scripts `7.IsIdentityIssuer.js` and/or `8.isIdentityServiceProvider.js`

## Error cases

The following cases will return an error (`Transaction has been reverted by the EVM`)

1. Create an issuer identity that already exists
2. Try to delete an issuer identity that doesn't exists
3. Create an service provider identity that already exists
4. Try to delete an service provider identity that doesn't exists
