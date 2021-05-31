const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const fs = require('fs')
const keythereum = require('keythereum')
const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const presentationHashData = fs.readFileSync(`./PSMHashEntity2.json`)
const presentationHash = JSON.parse(presentationHashData)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const keyDataEntity2 = fs.readFileSync(
  '../keystores/entity2-ad88f1a89cf02a32010b971d8c8af3a2c7b3bd94.json'
)
const keystoreDataEntity2 = JSON.parse(keyDataEntity2)

const entity2Keystore = keystoreDataEntity2

let entity2PrivateKey
try {
  entity2PrivateKey = keythereum.recover(
    configData.addressPassword,
    entity2Keystore
  )
} catch (error) {
  console.error('ERROR: ', error)
}

const entity2Identity = new UserIdentity(
  web3,
  `0x${entity2Keystore.address}`,
  entity2PrivateKey
)

const updateEntity2Presentation =
  transactionFactory.presentationRegistry.updateReceiverPresentation(
    web3,
    presentationHash.psmhash,
    configData.updateEntity2PresentationTo
  )

if (configData.didEntity2 === undefined) {
  console.error('You must create an Alastria ID')
  process.exit(1)
}

async function main() {
  const updateReceivP = await entity2Identity.getKnownTransaction(
    updateEntity2Presentation
  )
  console.log(
    '(updateEntity2Presentation)The transaction bytes data is: ',
    updateReceivP
  )
  web3.eth.sendSignedTransaction(updateReceivP).then(() => {
    const presentationStatus =
      transactionFactory.presentationRegistry.getReceiverPresentationStatus(
        web3,
        configData.didEntity2,
        presentationHash.psmhash
      )

    web3.eth.call(presentationStatus).then((result) => {
      const resultStatus = web3.eth.abi.decodeParameters(
        ['bool', 'uint8'],
        result
      )
      const presentationStatus = {
        exist: resultStatus[0],
        status: resultStatus[1]
      }
      console.log(
        'presentationStatus of the entity2------>',
        presentationStatus
      )
    })
  })
}

main()
