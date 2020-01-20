const {transactionFactory} = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

  if(configData.entity3 == undefined) {
    console.log('You must create an Alastria ID')
    process.exit()
  }

let currentPubKey = transactionFactory.publicKeyRegistry.getCurrentPublicKey(web3, configData.entity3)

web3.eth.call(currentPubKey)
.then(result => {
  let publicKey = web3.utils.hexToUtf8(result)
  console.log('RESULT ----->', publicKey)
})
.catch(error => {
  console.log('Error -------->', error)
})

