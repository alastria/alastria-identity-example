const {transactionFactory, UserIdentity} = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let keyDataEntity1 = fs.readFileSync('../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json')
let keystoreDataEntity1 = JSON.parse(keyDataEntity1)
let keyDataAdmin = fs.readFileSync('../keystores/admin-6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11.json')
let keystoreDataAdmin = JSON.parse(keyDataAdmin)

let adminKeyStore = keystoreDataAdmin

let adminPrivateKey
try {
	adminPrivateKey = keythereum.recover(configData.addressPassword, adminKeyStore)
} catch (error) {
	console.log("ERROR: ", error)
	process.exit(1);
}

let adminIdentity = new UserIdentity(web3, `0x${adminKeyStore.address}`, adminPrivateKey)

let entity1KeyStore = keystoreDataEntity1

let entity1PrivateKey
try{
	entity1PrivateKey = keythereum.recover(configData.addressPassword, entity1KeyStore)
}catch(error){
	console.log("ERROR: ", error)
}

let entity1Identity = new UserIdentity(web3, `0x${entity1KeyStore.address}`, entity1PrivateKey)
//------------------------------------------------------------------------------
console.log('\n ------ Setting entity Cif ------ \n')

	if(configData.subject1 == undefined) {
		console.log('You must create an Alastria ID')
		process.exit()
    }
    
    async function mainSetCifEntity(){
        console.log('\n ------ Example of setting Cif of entity1 like a Entity ------ \n')
        let transactionEntityCif = await transactionFactory.identityManager.setCifEntity(web3, configData.didEntity1, "A-2866354")
        let getKnownTxEntityCif = await adminIdentity.getKnownTransaction(transactionEntityCif)
        web3.eth.sendSignedTransaction(getKnownTxEntityCif)
                .on('transactionHash', function (hashSetCifEntity) {
                    console.log("HASH: ", hashSetCifEntity)
                })
                .on('receipt', function (receiptSetCifEntity) {
                    console.log("RECEIPT: ", receiptSetCifEntity)
                })
        
                .on('error', function (error) {
                    console.error(error)
                    process.exit(1);
                });// If this is a revert, probably this Subject (address) is already a SP
    }

    mainSetCifEntity()