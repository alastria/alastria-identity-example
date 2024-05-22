const {
  transactionFactory,
  UserIdentity,
  tokensFactory
} = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const keyDataSubject1 = fs.readFileSync(
  '../keystores/subject1-806bc0d7a47b890383a831634bcb92dd4030b092.json'
)
const keystoreDataSubject1 = JSON.parse(keyDataSubject1)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))
// ------------------------------------------------------------------------------
console.log('\n ------ Preparing Subject1 identity ------ \n')

// Some fake data to test
const subject1KeyStore = keystoreDataSubject1

let subject1PrivateKey
try {
  subject1PrivateKey = keythereum.recover(
    configData.addressPassword,
    subject1KeyStore
  )
} catch (error) {
  console.error('ERROR: ', error)
}

const subject1Identity = new UserIdentity(
  web3,
  `0x${subject1KeyStore.address}`,
  subject1PrivateKey
)

const didSubject1 = configData.didSubject1
const uri = configData.uri

// End fake data to test

const rawjson = fs.readFileSync(`./PSMHashEntity1.json`)
const json = JSON.parse(rawjson)
const signedJWTCredential = json.jwt
console.log('The signed token is: ', signedJWTCredential)

const subjectCredentialHash = tokensFactory.tokens.PSMHash(
  web3,
  signedJWTCredential,
  didSubject1
)
console.log('The Subject1 PSMHash is ', subjectCredentialHash)
fs.writeFileSync(
  `./PSMHashSubject1.json`,
  JSON.stringify({ psmhash: subjectCredentialHash, jwt: signedJWTCredential })
)

function addSubjectCredential() {
  const subjectCredential =
    transactionFactory.credentialRegistry.addSubjectCredential(
      web3,
      subjectCredentialHash,
      uri
    )
  console.log('(addSubjectCredential)The transaction is: ', subjectCredential)
  return subjectCredential
}

function sendSigned(subjectCredentialSigned) {
  return new Promise((resolve, reject) => {
    // web3 default subject address
    web3.eth
      .sendSignedTransaction(subjectCredentialSigned)
      .on('transactionHash', function (hash) {
        console.log('HASH: ', hash)
      })
      .on('receipt', (receipt) => {
        resolve(receipt)
      })
      .on('error', (error) => {
        console.error('Error------>', error)
        reject(error)
        process.exit(1)
      })
  })
}

async function main() {
  const resultSubjectCredential = await addSubjectCredential()

  const subjectCredentialSigned = await subject1Identity.getKnownTransaction(
    resultSubjectCredential
  )
  console.log(
    '(addSubjectCredential)The transaction bytes data is: ',
    subjectCredentialSigned
  )
  sendSigned(subjectCredentialSigned).then((receipt) => {
    console.log('RECEIPT:', receipt)
    const subjectCredentialTransaction =
      transactionFactory.credentialRegistry.getSubjectCredentialStatus(
        web3,
        configData.didSubject1,
        subjectCredentialHash
      )
    web3.eth
      .call(subjectCredentialTransaction)
      .then((SubjectCredentialStatus) => {
        const result = web3.eth.abi.decodeParameters(
          ['bool', 'uint8'],
          SubjectCredentialStatus
        )
        const credentialStatus = {
          exists: result[0],
          status: result[1]
        }
        console.log('(SubjectCredentialStatus) -----> ', credentialStatus)
      })
  })
}
main()
