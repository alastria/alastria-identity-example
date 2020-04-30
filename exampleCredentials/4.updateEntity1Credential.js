const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
let fs = require('fs')
let keythereum = require('keythereum')
let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let issuerHashData = fs.readFileSync(`./PSMHashEntity1.json`)
let credentialHash = JSON.parse(issuerHashData)

let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let updateCredentialStatus = transactionFactory.credentialRegistry.updateCredentialStatus(web3, credentialHash.psmhash, configData.updateIssuerCredentialTo)

let keyDataEntity1 = fs.readFileSync('../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json')
let keystoreDataEntity1 = JSON.parse(keyDataEntity1)

let entity1Keystore = keystoreDataEntity1

let entity1PrivateKey
try{
	entity1PrivateKey = keythereum.recover(configData.addressPassword, entity1Keystore)
}catch(error){
	console.log("ERROR: ", error)
}

let entity1Identity = new UserIdentity(web3, `0x${entity1Keystore.address}`, entity1PrivateKey)

  if(configData.didEntity1 == undefined) {
    console.log('You must create an Alastria ID')
    process.exit()
  }

async function main() {
  let updateCredStat = await entity1Identity.getKnownTransaction(updateCredentialStatus)
  console.log('(updateCredentialStatus)The transaction bytes data is: ', updateCredStat)
  web3.eth.sendSignedTransaction(updateCredStat)
    .then(() => {
			let issuerCredentialTransaction = transactionFactory.credentialRegistry.getIssuerCredentialStatus(web3, configData.didEntity1, credentialHash.psmhash)
				web3.eth.call(issuerCredentialTransaction)
				.then(IssuerCredentialStatus => {
					let result = web3.eth.abi.decodeParameters(["bool","uint8"],IssuerCredentialStatus)
					let credentialStatus = { 
						"exists": result[0],
						"status":result[1]
					}
					console.log("(IssuerCredentialStatus) -----> ", credentialStatus);
        })
    })
}

main()
