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
console.log('\n ------ Setting entity Logo ------ \n')

	if(configData.subject1 === undefined) {
		console.error('You must create an Alastria ID')
		process.exit(1)
    }

    async function mainSetLogoEntity(){
        console.log('\n ------ Example of setting Logo of entity1 like a Entity ------ \n')
        const transactionEntityLogo = await transactionFactory.alastriaNameService.setUrlLogo(
            web3, 
            configData.didEntity1, 
            "www.NombreEntidad.com/logo"
        )
        const getKnownTxEntityLogo = await firstIdentityIdentity.getKnownTransaction(
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

