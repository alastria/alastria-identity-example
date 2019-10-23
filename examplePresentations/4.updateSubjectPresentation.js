const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
let fs = require('fs')
let keythereum = require('keythereum')
let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let presentationHashData = fs.readFileSync(`./PSMHash.json`)
let presentationHash = JSON.parse(presentationHashData)

let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let updateSubjectPresentation = transactionFactory.presentationRegistry.updateSubjectPresentation(web3, presentationHash.psmhash, 2)
console.log(updateSubjectPresentation)

let keyData = fs.readFileSync('../keystore.json')
let keystoreData = JSON.parse(keyData)

let identityKeystore = keystoreData.identityKeystore

let identityPrivateKey
try {
  identityPrivateKey = keythereum.recover(keystoreData.addressPassword, identityKeystore)
} catch (error) {
  console.log("ERROR: ", error)
}

let subjectIdentity = new UserIdentity(web3, `0x${identityKeystore.address}`, identityPrivateKey)

async function main() {
  let updateSubjP = await subjectIdentity.getKnownTransaction(updateSubjectPresentation)
  console.log('(updateSubjectPresentation)The transaction bytes data is: ', updateSubjP)
  web3.eth.sendSignedTransaction(updateSubjP)
    .then(() => {
      let presentationStatus = transactionFactory.presentationRegistry.getSubjectPresentationStatus(web3, configData.subject, presentationHash.psmhash)

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
