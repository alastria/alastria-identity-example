const { transactionFactory } = require('alastria-identity-lib')
let fs = require('fs')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

  if(configData.recieverPresentationStatus == undefined || configData.subjectPresentationStatus == undefined){
    console.log('You must create Presentation')
    process.exit()
  }

let globalStatus = transactionFactory.presentationRegistry.getPresentationStatus(web3, configData.subjectPresentationStatus.status, configData.recieverPresentationStatus.status)
web3.eth.call(globalStatus)
.then(result => {
    let resultStatus = web3.utils.hexToNumber(result);
    switch (resultStatus) {
      case 0:
          console.log('Valid =>', resultStatus)
          break;
      case 1:
          console.log('Received =>', resultStatus)
          break;
      case 2:
          console.log('AskDeletion =>', resultStatus)
          break;
      case 3:
          console.log('DeletionConfirmation =>', resultStatus)
          break;   
    }
})
