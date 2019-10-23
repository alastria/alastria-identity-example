const { transactionFactory } = require('alastria-identity-lib')
let fs = require('fs')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let presentationHashData = fs.readFileSync(`./PSMHash.json`)
let presentationHash = JSON.parse(presentationHashData)

let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

if(configData.subject == undefined) {
  console.log('You must create an Alastria ID')
  process.exit()
}

let presentationStatus = transactionFactory.presentationRegistry.getSubjectPresentationStatus(web3, configData.subject, presentationHash.psmhash)
console.log(presentationStatus)

web3.eth.call(presentationStatus)
.then(result => {
  let resultStatus = web3.eth.abi.decodeParameters(["bool", "uint8"], result)
  let presentationStatus = {
    exist: resultStatus[0],
    status: resultStatus[1]
  }
  console.log('presentationStatus ------>', presentationStatus)
})