
const { transactionFactory,tokensFactory } = require('alastria-identity-lib')
let fs = require('fs')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)


let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))
let receiver=configData.receiver;

let presentationHashData = fs.readFileSync(`./PSMHashReceiver.json`)
let presentationHash = JSON.parse(presentationHashData)

if(configData.receiver == undefined) {
console.log('You must create an Alastria ID')
process.exit()
}

let presentationStatus = transactionFactory.presentationRegistry.getReceiverPresentationStatus(web3, receiver, presentationHash.psmhash)
console.log("VIEW",presentationHash.psmhash)
console.log(presentationStatus)

web3.eth.call(presentationStatus)
.then(result => {
let resultStatus = web3.eth.abi.decodeParameters(["bool", "uint8"], result)
let presentationStatus = {
exist: resultStatus[0],
status: resultStatus[1]
}
configData.recieverPresentationStatus = receiverPresentationStatus;
fs.writeFileSync('../configuration.json', JSON.stringify(configData))
console.log('presentationStatus ------>', presentationStatus)
})

