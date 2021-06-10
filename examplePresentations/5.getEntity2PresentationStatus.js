const { transactionFactory } = require('alastria-identity-lib')
const fs = require('fs')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const presentationHashData = fs.readFileSync(`./PSMHashEntity2.json`)
const presentationHash = JSON.parse(presentationHashData)

if (configData.didEntity2 === undefined) {
  console.error('You must create an Alastria ID')
  process.exit(1)
}

const presentationStatus =
  transactionFactory.presentationRegistry.getReceiverPresentationStatus(
    web3,
    configData.didEntity2,
    presentationHash.psmhash
  )

web3.eth.call(presentationStatus).then((result) => {
  const resultStatus = web3.eth.abi.decodeParameters(['bool', 'uint8'], result)
  const presentationStatus = {
    exist: resultStatus[0],
    status: resultStatus[1]
  }
  console.log('presentationStatus ------>', presentationStatus)
})
