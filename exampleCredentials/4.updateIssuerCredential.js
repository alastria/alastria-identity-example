const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
let fs = require('fs')
let keythereum = require('keythereum')
let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let issuerHashData = fs.readFileSync(`./PSMHashIssuer.json`)
let credentialHash = JSON.parse(issuerHashData)

let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let updateCredentialStatus = transactionFactory.credentialRegistry.updateCredentialStatus(web3, credentialHash.psmhash, configData.updateIssuerCredentialTo)

let keyData = fs.readFileSync('../keystore.json')
let keystoreData = JSON.parse(keyData)

let issuerKeystore = keystoreData.issuerKeystore

let identityPrivateKey
try {
  identityPrivateKey = keythereum.recover(keystoreData.addressPassword, issuerKeystore)
} catch (error) {
  console.log("ERROR: ", error)
}

let issuerIdentity = new UserIdentity(web3, `0x${issuerKeystore.address}`, identityPrivateKey)

  if(configData.subject == undefined) {
    console.log('You must create an Alastria ID')
    process.exit()
  }

async function main() {
  let updateCredStat = await issuerIdentity.getKnownTransaction(updateCredentialStatus)
  console.log('(updateCredentialStatus)The transaction bytes data is: ', updateCredStat)
  web3.eth.sendSignedTransaction(updateCredStat)
    .then(() => {
      let issuer = configData.issuer  //by the moment, change it manually from alastriaProxyAddress result in script exampleCreateAlastriaID.js 
			let issuerCredentialTransaction = transactionFactory.credentialRegistry.getIssuerCredentialStatus(web3, issuer, credentialHash.psmhash)
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
