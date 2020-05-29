const { transactionFactory } = require('alastria-identity-lib')
const fs = require('fs')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

  if(configData.entity2PresentationStatus === undefined || configData.subject1PresentationStatus === undefined){
    console.log('You must create Presentation')
    process.exit()
  }

const globalStatus = transactionFactory.presentationRegistry.getPresentationStatus(web3, configData.subject1PresentationStatus.status, configData.entity2PresentationStatus.status)
web3.eth.call(globalStatus)
.then(result => {
    const resultStatus = web3.utils.hexToNumber(result);
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
