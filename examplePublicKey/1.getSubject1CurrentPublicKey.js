const {transactionFactory} = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

  if(configData.didSubject1 == undefined) {
    console.log('You must create an Alastria ID')
    process.exit()
  }

const currentPubKey = transactionFactory.publicKeyRegistry.getCurrentPublicKey(web3, configData.didSubject1)
web3.eth.call(currentPubKey)
.then(result => {
  // We add this replace to find only the alphanumeric substring (the rest of null/void characters are not important)
  const publicKey = web3.utils.hexToAscii(result).replace(/[^0-9A-Z]+/gi,"")
  console.log('RESULT ----->', publicKey)
})
.catch(error => {
  console.log('Error -------->', error)
})

