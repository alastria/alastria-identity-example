# Important
In this folder we have four files:
1. addEntity ([`exampleServiceProvider/1.addEntity.js`](1.addEntity.js))
2. addIdentityServiceProvider ([`exampleServiceProvider/2.addIdentityServiceProvider.js`](2.addIdentityServiceProvider.js)) 
3. deleteIdentityServiceProvider ([`exampleServiceProvider/3.deleteIdentityServiceProvider.js`](3.deleteIdentityServiceProvider.js)).
4. isServiceProvider ([`exampleServiceProvider/3.isServiceProvider.js`](4.isServiceProvider.js)).

You must execute first the scrypt 1.addEntity.js, and then 2. addIdentityServiceProvider. 
You can execute scrypt 4.isServiceProvider if you want to know that the entity is a Service Provider or not.

Also, you can execute the scrypt 3.deleteIdentityServiceProvider.js if you want to remove that entity as a Service Provider role.

## Error cases
The following cases will return an error (`Transaction has been reverted by the EVM`)
1. Create a service provider identity that already exists
2. Try to delete a service provider identity that doesn't exists


