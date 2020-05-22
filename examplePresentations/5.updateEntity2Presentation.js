const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
let fs = require('fs')
let keythereum = require('keythereum')
let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let presentationHashData = fs.readFileSync(`./PSMHashEntity2.json`)
let presentationHash = JSON.parse(presentationHashData)

let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let keyDataEntity2 = fs.readFileSync('../keystores/entity2-ad88f1a89cf02a32010b971d8c8af3a2c7b3bd94.json')
let keystoreDataEntity2 = JSON.parse(keyDataEntity2)

let entity2Keystore = keystoreDataEntity2

let entity2PrivateKey
try{
	entity2PrivateKey = keythereum.recover(configData.addressPassword, entity2Keystore)
}catch(error){
	console.log("ERROR: ", error)
}

let entity2Identity = new UserIdentity(web3, `0x${entity2Keystore.address}`, entity2PrivateKey)


let updateEntity2Presentation = transactionFactory.presentationRegistry.updateReceiverPresentation(web3, presentationHash.psmhash, configData.updateEntity2PresentationTo)

  if(configData.didEntity2 == undefined) {
    console.log('You must create an Alastria ID')
    process.exit()
  }

async function main() {
  let updateReceivP = await entity2Identity.getKnownTransaction(updateEntity2Presentation)
  console.log('(updateEntity2Presentation)The transaction bytes data is: ', updateReceivP)
  web3.eth.sendSignedTransaction(updateReceivP)
    .then(() => {
      let presentationStatus = transactionFactory.presentationRegistry.getReceiverPresentationStatus(web3, configData.didEntity2, presentationHash.psmhash)

      web3.eth.call(presentationStatus)
        .then(result => {
          let resultStatus = web3.eth.abi.decodeParameters(["bool", "uint8"], result)
          let presentationStatus = {
            exist: resultStatus[0],
            status: resultStatus[1]
          }
          configData.entity2PresentationStatus = presentationStatus;
          fs.writeFileSync('../configuration.json', JSON.stringify(configData))
          console.log('presentationStatus of the entity2------>', configData.entity2PresentationStatus)
        })
    })
}

main()


