const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const fs = require('fs')
const keythereum = require('keythereum')
const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const presentationHashData = fs.readFileSync(`./PSMHashSubject1.json`)
const presentationHash = JSON.parse(presentationHashData)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const updateSubjectPresentation = transactionFactory.presentationRegistry.updateSubjectPresentation(
  web3,
  presentationHash.psmhash,
  configData.updateSubject1PresentationTo
)

const keyDataSubject1 = fs.readFileSync(
  '../keystores/subject1-806bc0d7a47b890383a831634bcb92dd4030b092.json'
)
const keystoreDataSubject1 = JSON.parse(keyDataSubject1)

const subject1Keystore = keystoreDataSubject1

let subject1PrivateKey
try {
  subject1PrivateKey = keythereum.recover(
    configData.addressPassword,
    subject1Keystore
  )
} catch (error) {
  console.log('ERROR: ', error)
}

const subject1Identity = new UserIdentity(
  web3,
  `0x${subject1Keystore.address}`,
  subject1PrivateKey
)

if (configData.didSubject1 === undefined) {
  console.log('You must create an Alastria ID')
  process.exit()
}

async function main() {
  const updateSubjP = await subject1Identity.getKnownTransaction(
    updateSubjectPresentation
  )
  console.log(
    '(updateSubjectPresentation)The transaction bytes data is: ',
    updateSubjP
  )
  web3.eth.sendSignedTransaction(updateSubjP).then(() => {
    const presentationStatus = transactionFactory.presentationRegistry.getSubjectPresentationStatus(
      web3,
      configData.didSubject1,
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
      configData.subject1PresentationStatus = presentationStatus
      fs.writeFileSync('../configuration.json', JSON.stringify(configData))
      console.log(
        'presentationStatus of the subject1 ------>',
        configData.subject1PresentationStatus
      )
    })
  })
}

main()
