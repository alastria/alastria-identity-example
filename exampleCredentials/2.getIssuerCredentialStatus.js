const { transactionFactory } = require('alastria-identity-lib')
const fs = require('fs')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const credentialHashData = fs.readFileSync(`./PSMHashEntity1.json`)
const credentialHash = JSON.parse(credentialHashData)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

if (configData.didSubject1 === undefined) {
  console.error('You must create an Alastria ID')
  process.exit(1)
}

const credentialStatus =
  transactionFactory.credentialRegistry.getIssuerCredentialStatus(
    web3,
    configData.didEntity1,
    credentialHash.psmhash
  )

web3.eth.call(credentialStatus).then((result) => {
  const resultStatus = web3.eth.abi.decodeParameters(['bool', 'uint8'], result)
  const credentialStatus = {
    exist: resultStatus[0],
    status: resultStatus[1]
  }
  console.log('presentationStatus ------>', credentialStatus)
})
