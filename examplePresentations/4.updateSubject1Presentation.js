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

let keyDataSubject1 = fs.readFileSync('../keystores/subject1-806bc0d7a47b890383a831634bcb92dd4030b092.json')
let keystoreDataSubject1 = JSON.parse(keyDataSubject1)

let subject1Keystore = keystoreDataSubject1

let subject1PrivateKey
try{
	subject1PrivateKey = keythereum.recover(configData.addressPassword, subject1Keystore)
}catch(error){
	console.log("ERROR: ", error)
}

let subject1Identity = new UserIdentity(web3, `0x${subject1Keystore.address}`, subject1PrivateKey)

  if(configData.didSubject1 == undefined) {
    console.log('You must create an Alastria ID')
    process.exit()
  }

async function main() {
  let updateSubjP = await subject1Identity.getKnownTransaction(updateSubjectPresentation)
  console.log('(updateSubjectPresentation)The transaction bytes data is: ', updateSubjP)
  web3.eth.sendSignedTransaction(updateSubjP)
    .then(() => {
      let presentationStatus = transactionFactory.presentationRegistry.getSubjectPresentationStatus(web3, configData.didSubject1, presentationHash.psmhash)

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
