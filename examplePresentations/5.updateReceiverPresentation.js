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

let issuerKeystore = keystoreData.issuerKeystore

let issuerPrivateKey
try {
  issuerPrivateKey = keythereum.recover(keystoreData.addressPassword, issuerKeystore)
} catch (error) {
  console.log("ERROR: ", error)
}

let receiverIdentity = new UserIdentity(web3, `0x${issuerKeystore.address}`, issuerPrivateKey)


let updateReceiverPresentation = transactionFactory.presentationRegistry.updateReceiverPresentation(web3, presentationHash.psmhash, configData.updateReceiverPresentationTo)

  if(configData.receiver == undefined) {
    console.log('You must create an Alastria ID')
    process.exit()
  }

async function main() {
  let updateReceivP = await receiverIdentity.getKnownTransaction(updateReceiverPresentation)
  console.log('(updateReceiverPresentation)The transaction bytes data is: ', updateReceivP)
  web3.eth.sendSignedTransaction(updateReceivP)
    .then(() => {
      let presentationStatus = transactionFactory.presentationRegistry.getReceiverPresentationStatus(web3, configData.issuer, presentationHash.psmhash)

      web3.eth.call(presentationStatus)
        .then(result => {
          let resultStatus = web3.eth.abi.decodeParameters(["bool", "uint8"], result)
          let presentationStatus = {
            exist: resultStatus[0],
            status: resultStatus[1]
          }
          configData.recieverPresentationStatus = presentationStatus;
          fs.writeFileSync('../configuration.json', JSON.stringify(configData))
          console.log('presentationStatus ------>', configData.recieverPresentationStatus)
        })
    })
}

main()


