const { transactionFactory } = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

if (configData.didSubject1 === undefined) {
  console.error('You must create an Alastria ID')
  process.exit(1)
}
const subject1PubKeyHash = `${web3.utils.sha3(configData.subject1Pubk.substr(2))}`
const currentPubKey = transactionFactory.publicKeyRegistry.getPublicKeyStatusHash(
  web3,
  configData.didSubject1,
  subject1PubKeyHash
)
console.log("TRANSACCION", currentPubKey);
web3.eth
  .call(currentPubKey)
  .then((result) => {
    // We add this replace to find only the alphanumeric substring (the rest of null/void characters are not important)
    const resultStatus = web3.eth.abi.decodeParameters(['bool', 'uint8', 'uint256', 'uint256'], result)
    const publicKeyStatus = {
      exist: resultStatus[0],
      status: resultStatus[1],
      startDate: resultStatus[2],
      endDate: resultStatus[3]
    }
    console.log('publicKeyStatus for Subject1 ------>', publicKeyStatus)
  })
  .catch((error) => {
    console.error('Error -------->', error)
    process.exit(1)
  })
