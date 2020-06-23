const {transactionFactory, UserIdentity} = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const keyDataAdmin = fs.readFileSync('../keystores/admin-6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11.json')
const keystoreDataAdmin = JSON.parse(keyDataAdmin)

const adminKeyStore = keystoreDataAdmin

let adminPrivateKey
try {
  adminPrivateKey = keythereum.recover(
    configData.addressPassword,
    adminKeyStore
  )
} catch (error) {
  console.log('ERROR: ', error)
  process.exit(1)
}

const adminIdentity = new UserIdentity(web3, `0x${adminKeyStore.address}`, adminPrivateKey)

// ------------------------------------------------------------------------------
console.log('\n ------ Setting entity Logo ------ \n')

	if(configData.subject1 === undefined) {
		console.log('You must create an Alastria ID')
		process.exit()
    }

    async function mainSetLogoEntity(){
        console.log('\n ------ Example of setting Logo of entity1 like a Entity ------ \n')
        const transactionEntityLogo = await transactionFactory.identityManager.setUrlLogo(
            web3, 
            configData.didEntity1, 
            "www.NombreEntidad.com/logo"
        )
        const getKnownTxEntityLogo = await adminIdentity.getKnownTransaction(
            transactionEntityLogo
        )
        web3.eth
            .sendSignedTransaction(getKnownTxEntityLogo)
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

