const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
let fs = require('fs')
let keythereum = require('keythereum')
let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let presentationHashData = fs.readFileSync(`./PSMHashSubject1.json`)
let presentationHash = JSON.parse(presentationHashData)

let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let updateSubjectPresentation = transactionFactory.presentationRegistry.updateSubjectPresentation(web3, presentationHash.psmhash, configData.updateSubject1PresentationTo)

let keyData = fs.readFileSync('../keystore/keystore.json')
let keystoreData = JSON.parse(keyData)

let subject1Keystore = keystoreData.subject1

let subject1PrivateKey
try{
	subject1PrivateKey = keythereum.recover(keystoreData.addressPassword, subject1Keystore)
}catch(error){
	console.log("ERROR: ", error)
}

let subject1Identity = new UserIdentity(web3, `0x${subject1Keystore.address}`, subject1PrivateKey)

  if(configData.subject1 == undefined) {
    console.log('You must create an Alastria ID')
    process.exit()
  }

async function main() {
  let updateSubjP = await subject1Identity.getKnownTransaction(updateSubjectPresentation)
  console.log('(updateSubjectPresentation)The transaction bytes data is: ', updateSubjP)
  web3.eth.sendSignedTransaction(updateSubjP)
    .then(() => {
      let presentationStatus = transactionFactory.presentationRegistry.getSubjectPresentationStatus(web3, configData.subject1, presentationHash.psmhash)

      web3.eth.call(presentationStatus)
        .then(result => {
          let resultStatus = web3.eth.abi.decodeParameters(["bool", "uint8"], result)
          let presentationStatus = {
            exist: resultStatus[0],
            status: resultStatus[1]
          }
          configData.subject1PresentationStatus = presentationStatus;
          fs.writeFileSync('../configuration.json', JSON.stringify(configData))
          console.log('presentationStatus of the subject1 ------>', configData.subject1PresentationStatus)
        })
    })
}

main()
