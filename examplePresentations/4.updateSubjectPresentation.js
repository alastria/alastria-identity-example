const {transactionFactory} = require('alastria-identity-lib')
let fs = require('fs')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let presentationHashData = fs.readFileSync(`./PSMHash.json`)
let presentationHash = JSON.parse(presentationHashData)

let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let updateSubjectPresentation = transactionFactory.presentationRegistry.updateSubjectPresentation(web3, presentationHash.psmhash, configData.status )
console.log(updateSubjectPresentation)

web3.eth.call(updateSubjectPresentation)
.then(result => {
  let resultStatus = web3.eth.abi.decodeParameters(["string"], result)
  let updateSubjectPresentation = {
    result: resultStatus[0]
  }
  console.log('update ------>', updateSubjectPresentation)
})