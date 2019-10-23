const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
let fs = require('fs')
let keythereum = require('keythereum')
let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let presentationHashData = fs.readFileSync(`./PSMHashReceiver.json`)
let presentationHash = JSON.parse(presentationHashData)

let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let keyData = fs.readFileSync('../keystore.json')
let keystoreData = JSON.parse(keyData)

let receiverKeystore = keystoreData.receiverKeystore

let identityPrivateKey
try {
  identityPrivateKey = keythereum.recover(keystoreData.addressPassword, receiverKeystore)
} catch (error) {
  console.log("ERROR: ", error)
}

let receiverIdentity = new UserIdentity(web3, `0x${receiverKeystore.address}`, identityPrivateKey)


let updateReceiverPresentation = transactionFactory.presentationRegistry.updateReceiverPresentation(web3, presentationHash.psmhash, configData.updateReceiverPresentationTo)
console.log(updateReceiverPresentation)


async function main() {
  let updateReceivP = await receiverIdentity.getKnownTransaction(updateReceiverPresentation)
  console.log('(updateReceiverPresentation)The transaction bytes data is: ', updateReceivP)
  web3.eth.sendSignedTransaction(updateReceivP)
    .then(() => {
      let presentationStatus = transactionFactory.presentationRegistry.getReceiverPresentationStatus(web3, configData.receiver, presentationHash.psmhash)

      web3.eth.call(presentationStatus)
        .then(result => {
          let resultStatus = web3.eth.abi.decodeParameters(["bool", "uint8"], result)
          let presentationStatus = {
            exist: resultStatus[0],
            status: resultStatus[1]
          }
          console.log('presentationStatus ------>', presentationStatus)
        })
    })
}

main()


