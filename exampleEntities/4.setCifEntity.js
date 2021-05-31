const {transactionFactory, UserIdentity} = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const keyDataFirstIdentity = fs.readFileSync('../keystores/firstIdentity-643266eb3105f4bf8b4f4fec50886e453f0da9ad.json')
const keystoreDataFirstIdentity = JSON.parse(keyDataFirstIdentity)

const firstIdentityKeyStore = keystoreDataFirstIdentity

let firstIdentityPrivateKey
try {
  firstIdentityPrivateKey = keythereum.recover(
    configData.addressPassword,
    firstIdentityKeyStore
  )
} catch (error) {
  console.error('ERROR: ', error)
  process.exit(1)
}

const firstIdentityIdentity = new UserIdentity(web3, `0x${firstIdentityKeyStore.address}`, firstIdentityPrivateKey)
// ------------------------------------------------------------------------------
console.log('\n ------ Setting entity Cif ------ \n')

	if(configData.subject1 === undefined) {
		console.log('You must create an Alastria ID')
		process.error(1)
    }
    
    async function mainSetCifEntity(){
        console.log('\n ------ Example of setting Cif of entity1 like a Entity ------ \n')
        const transactionEntityCif = await transactionFactory.alastriaNameService.setCifEntity(
            web3, 
            configData.didEntity1, 
            "A-2866354"
        )
        const getKnownTxEntityCif = await firstIdentityIdentity.getKnownTransaction(
            transactionEntityCif
        )
        web3.eth
            .sendSignedTransaction(getKnownTxEntityCif)
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