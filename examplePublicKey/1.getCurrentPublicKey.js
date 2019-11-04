const {transactionFactory} = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))


let subject = configData.subject

let currentPubKey = transactionFactory.publicKeyRegistry.getCurrentPublicKey(web3, subject)
console.log(currentPubKey)

web3.eth.call(currentPubKey)
.then(result => {
  let publicKey = web3.utils.hexToUtf8(result)
  console.log('RESULT ----->', publicKey.substr(1))
})
.catch(error => {
  console.log('Error -------->', error)
})

