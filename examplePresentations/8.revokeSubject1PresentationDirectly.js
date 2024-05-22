const { transactionFactory, UserIdentity, tokensFactory } = require('alastria-identity-lib')
const fs = require('fs')
const keythereum = require('keythereum')
const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const presentationRawData = fs.readFileSync('./mockPresentation.json')
const presentationData = JSON.parse(presentationRawData)

const keyDataSubject1 = fs.readFileSync(
  '../keystores/subject1-806bc0d7a47b890383a831634bcb92dd4030b092.json'
)
const keystoreDataSubject1 = JSON.parse(keyDataSubject1)

const keyDataEntity2 = fs.readFileSync(
  '../keystores/entity2-ad88f1a89cf02a32010b971d8c8af3a2c7b3bd94.json'
)
const keystoreDataEntity2 = JSON.parse(keyDataEntity2)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

console.log('\n ------ Preparing Subject1 identity ------ \n')

// Some fake data to test
//PREPARING SUBJECT1 IDENTITY
const subject1Keystore = keystoreDataSubject1

let subject1PrivateKey
try {
  subject1PrivateKey = keythereum.recover(
    configData.addressPassword,
    subject1Keystore
  )
} catch (error) {
  console.error('ERROR: ', error)
  process.exit(1)
}

const subject1Identity = new UserIdentity(
  web3,
  `0x${subject1Keystore.address}`,
  subject1PrivateKey
)

//PREPARING ENTITY2 IDENTITY
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

//IDENTITY CHECK FOR SUBJECT1
if (configData.didSubject1 === undefined) {
  console.error('You must create an Alastria ID for Subject1')
  process.exit(1)
}

//IDENTITY CHECK FOR ENTITY2
if (configData.didEntity2 === undefined) {
  console.error('You must create an Alastria ID for Entity2')
  process.exit(1)
}

//PRESENTATION DATA
const createPresentation = tokensFactory.tokens.createPresentation(
  presentationData.credentials[0].payload.iss,
  presentationData.credentials[0].payload.aud,
  presentationData.credentials[0].payload.vp['@context'],
  presentationData.credentials[0].payload.vp.verifiableCredential,
  presentationData.credentials[0].payload.vp.procUrl,
  presentationData.credentials[0].payload.vp.procHash,
  presentationData.credentials[0].payload.vp.type,
  presentationData.credentials[0].header.kid,
  presentationData.credentials[0].header.jwk,
  presentationData.credentials[0].payload.exp,
  presentationData.credentials[0].payload.nbf,
  presentationData.credentials[0].payload.jti
)
console.log('createPresentation ---------->', createPresentation)

//SUBJECT1 SIGN PRESENTATION
const signedJWTPresentation = tokensFactory.tokens.signJWT(
  createPresentation,
  subject1PrivateKey
)
console.log('signedJWTPresentation ------------->', signedJWTPresentation)

//BUILD PRESENTATION PSMHASHES 
const subjectPresentationHash = tokensFactory.tokens.PSMHash(
  web3,
  signedJWTPresentation,
  configData.didSubject1
)

const entity2PresentationHash = tokensFactory.tokens.PSMHash(
  web3,
  signedJWTPresentation,
  configData.didEntity2
)

//BUILD TRANSACTION updateSubjectPresentation WITH transactionFactory LIBRARY
const updateSubjectPresentation =
  transactionFactory.presentationRegistry.updateSubjectPresentation(
    web3,
    subjectPresentationHash,
    configData.updateSubject1PresentationTo
  )

async function main() {
  const updateSubjP = await subject1Identity.getKnownTransaction(
    updateSubjectPresentation
  )
  console.log(
    '(updateSubjectPresentation)The transaction bytes data is: ',
    updateSubjP
  )

  //BUILD getSubjectPresentationStatus TRANSACTION WITH transactionFactory LIBRARY
  web3.eth.sendSignedTransaction(updateSubjP).then(() => {
    const presentationStatus =
      transactionFactory.presentationRegistry.getSubjectPresentationStatus(
        web3,
        configData.didSubject1,
        subjectPresentationHash
      )

    web3.eth
      .call(presentationStatus)
      .then((result) => {
        const resultStatus = web3.eth.abi.decodeParameters(
          ['bool', 'uint8'],
          result
        )
        const presentationStatus = {
          exist: resultStatus[0],
          status: resultStatus[1]
        }
        console.log(
          'presentationStatus of the subject1 ------>',
          presentationStatus
        )
      })
  })

  //BUILD getReceiverPresentationStatus TRANSACTION WITH transactionFactory LIBRARY
  const entity2PresentationStatus = transactionFactory.presentationRegistry.getReceiverPresentationStatus(
    web3,
    configData.didEntity2,
    entity2PresentationHash
  )
  web3.eth
    .call(entity2PresentationStatus)
    .then((result) => {
      const resultStatus = web3.eth.abi.decodeParameters(
        ['bool', 'uint8'],
        result
      )
      const presentationStatus = {
        exist: resultStatus[0],
        status: resultStatus[1]
      }
      console.log(
        'presentationStatus of the entity2 ------>',
        presentationStatus
      )
    })
}

main()
