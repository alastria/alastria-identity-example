let any = require('jsontokens')
const {transactionFactory, UserIdentity, tokensFactory} = require('alastria-identity-lib')
let Web3 = require('web3')
let keythereum = require('keythereum')

// Init your blockchain provider
let myBlockchainServiceIp = 'http://63.33.206.111/rpc'
//let myBlockchainServiceIp = 'http://127.0.0.1:8545' //Ganache
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))
console.log('VERSION: ', web3.version)

console.log('\n ------ Example of prepare Alastria ID, addKey and createAlastrisID necessary to have an Alastria ID ------ \n')
// Data
const rawPublicKey = '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479'

let adminKeyStore = {"address":"6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11","crypto":{"cipher":"aes-128-ctr","ciphertext":"463a0bc2146023ac4b85f4e3675c338facb0a09c4f83f5f067e2d36c87a0c35e","cipherparams":{"iv":"d731f9793e33b3574303a863c7e68520"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"876f3ca79af1ec9b77f181cbefc45a2f392cb8eb99fe8b3a19c79d62e12ed173"},"mac":"230bf3451a7057ae6cf77399e6530a88d60a8f27f4089cf0c07319f1bf9844b3"},"id":"9277b6ec-6c04-4356-9e1c-dee015f459c5","version":3};

let adminPrivateKey
try{
	adminPrivateKey = keythereum.recover('Passw0rd', adminKeyStore)
}catch(error){
	console.log("ERROR: ", error)
}

let adminIdentity = new UserIdentity(web3, `0x${adminKeyStore.address}`, adminPrivateKey)

let identityKeystore = {"address":"de7ab34219563ac50ccc7b51d23b9a61d22a383e","crypto":{"cipher":"aes-128-ctr","ciphertext":"f066be0beb82e68322631c4f0f40281c66e960703db2c6594e4ce0d78939b746","cipherparams":{"iv":"bc51f4f3cbbf2f96309cf9bd5a064ddc"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"dd8ddb3fd111c7a8d3087d6f893f6035a04231db7fa35945c68f9f9f0701201b"},"mac":"bb7004ae356e468bd500921ae43e47edc0a96cc4a0ce71b45d85f808eaa7d58d"},"id":"f9b634c0-d151-4751-ac0f-9686761aec03","version":3};

let subjectPrivateKey
try{
	subjectPrivateKey = keythereum.recover('Passw0rd', identityKeystore)
}catch(error){
	console.log("ERROR: ", error)
}

let subjectIdentity = new UserIdentity(web3, `0x${identityKeystore.address}`, subjectPrivateKey)
// End data

console.log('\n ------ Step one---> prepareAlastriaID inside a Promise ------ \n')
let p1 = new Promise (async(resolve, reject) => {
	let preparedId = await transactionFactory.identityManager.prepareAlastriaID(web3, identityKeystore.address)
	console.log(preparedId)
	resolve(preparedId)
})

console.log('\n ------ Step two---> createAlsatriaID inside a second Promise ------ \n')
let p2 = new Promise(async(resolve, reject) => {
	let txCreateAlastriaID = await transactionFactory.identityManager.createAlastriaIdentity(web3, rawPublicKey)
	console.log(txCreateAlastriaID)
	resolve(txCreateAlastriaID)
})

console.log('\n ------ Step three---> A promise all where prepareAlastriaID and createAlsatriaID transactions are signed and sent ------ \n')
Promise.all([p1, p2])
.then(async values => {
	let signedCreateTransaction =	await subjectIdentity.getKnownTransaction(values[1])
	let signedPreparedTransaction = await adminIdentity.getKnownTransaction(values[0])
	web3.eth.sendSignedTransaction(signedPreparedTransaction)
	.on('transactionHash', function (hash) {
		console.log("HASH: ", hash)
	})
	.on('receipt', function (receipt) {
		console.log("RECEIPT: ", receipt)
		web3.eth.sendSignedTransaction(signedCreateTransaction)
		.on('transactionHash', function (hash) {
				console.log("HASH: ", hash)
		})
		.on('receipt', function (receipt) {
				console.log("RECEIPT: ", receipt)
				web3.eth.call({
					to: '0x70e7e63928b8f274f018160207d4275fd8ea5bbe',				       
					data: '0x0c91465e000000000000000000000000de7ab34219563ac50ccc7b51d23b9a61d22a383e'
				})
				.then (AlastriaIdentity => {
					console.log(AlastriaIdentity)
				})
		})
		.on('error', console.error); // If a out of gas error, the second parameter is the receipt.
	})
	.on('error', console.error); // If a out of gas error, the second parameter is the receipt.
})

