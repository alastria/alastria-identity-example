
const { transactionFactory } = require('alastria-identity-lib')
let fs = require('fs')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)


let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let presentationHashData = fs.readFileSync(`./PSMHashEntity2.json`)
let presentationHash = JSON.parse(presentationHashData)

  if(configData.entity2 == undefined) {
    console.log('You must create an Alastria ID')
    process.exit()
  }

let presentationStatus = transactionFactory.presentationRegistry.getReceiverPresentationStatus(web3, configData.entity2, presentationHash.psmhash)

web3.eth.call(presentationStatus)
.then(result => {
  let resultStatus = web3.eth.abi.decodeParameters(["bool", "uint8"], result)
  let presentationStatus = {
    exist: resultStatus[0],
    status: resultStatus[1]
  }
  configData.entity2PresentationStatus = presentationStatus;
  fs.writeFileSync('../configuration.json', JSON.stringify(configData))
  console.log('presentationStatus ------>', presentationStatus)
})

