# Important
You must be executed the following examples in order to create the first entity.

1. createEntityAlastriaID ([`exampleFirstEntity/1.createEntityAlastriaID.js`](1.createEntityAlastriaID.js)) 
2. addIdentityIssuer ([`exampleFirstEntity/2.addIdentityIssuer.js`](2.addIdentityIssuer.js))
3. addIdentityServiceProvider ([`exampleFirstEntity/5.addIdentityServiceProvider.js`](5.addIdentityServiceProvider.js)) 

Only if you want to remove the entity from the mapping of Service provider or the mapping of Issuer, you must execute the examples three and four.


## Error cases
The following cases will return an error (`Transaction has been reverted by the EVM`)
1. Create an issuer identity that already exists
2. Try to delete an issuer identity that doesn't exists
3. Create an service provider identity that already exists
4. Try to delete an service provider identity that doesn't exists

