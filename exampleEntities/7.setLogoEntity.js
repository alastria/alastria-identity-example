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
console.log('\n ------ Setting entity Logo ------ \n')

	if(configData.subject1 == undefined) {
		console.log('You must create an Alastria ID')
		process.exit()
    }

    async function mainSetLogoEntity(){
        console.log('\n ------ Example of setting Logo of entity1 like a Entity ------ \n')
        let transactionEntityLogo = await transactionFactory.identityManager.setUrlLogo(web3, configData.didEntity1, "www.NombreEntidad.com/logo")
        let getKnownTxEntityLogo = await adminIdentity.getKnownTransaction(transactionEntityLogo)
        web3.eth.sendSignedTransaction(getKnownTxEntityLogo)
                .on('transactionHash', function (hashSetLogoEntity) {
                    console.log("HASH: ", hashSetLogoEntity)
                })
                .on('receipt', function (receiptSetLogoEntity) {
                    console.log("RECEIPT: ", receiptSetLogoEntity)
                })
        
                .on('error', function (error) {
                    console.error(error)
                    process.exit(1);
                });// If this is a revert, probably this Subject (address) is already a SP
    }
    
    mainSetLogoEntity()

