const { transactionFactory } = require('alastria-identity-lib')
const fs = require('fs')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const presentationHashData = fs.readFileSync(`./PSMHashSubject1.json`)
const presentationHash = JSON.parse(presentationHashData)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

  if(configData.didSubject1 === undefined) {
    console.log('You must create an Alastria ID')
    process.exit()
  }

const presentationStatus = transactionFactory.presentationRegistry.getSubjectPresentationStatus(web3, configData.didSubject1, presentationHash.psmhash)

web3.eth.call(presentationStatus)
.then(result => {
  const resultStatus = web3.eth.abi.decodeParameters(["bool", "uint8"], result)
  const presentationStatus = {
    exist: resultStatus[0],
    status: resultStatus[1]
  }
  configData.subject1PresentationStatus = presentationStatus;
  fs.writeFileSync('../configuration.json', JSON.stringify(configData))
  console.log('presentationStatus ------>', presentationStatus)
})
