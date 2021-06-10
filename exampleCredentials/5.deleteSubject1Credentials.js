const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const fs = require('fs')
const keythereum = require('keythereum')
const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const subjectHashData = fs.readFileSync(`./PSMHashSubject1.json`)
const credentialHash = JSON.parse(subjectHashData)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const deleteCredentialStatus =
  transactionFactory.credentialRegistry.deleteSubjectCredential(
    web3,
    credentialHash.psmhash
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
  console.error('ERROR: ', error)
}

const subject1Identity = new UserIdentity(
  web3,
  `0x${subject1Keystore.address}`,
  subject1PrivateKey
)

if (configData.didSubject1 === undefined) {
  console.error('You must create an Alastria ID')
  process.exit(1)
}

async function main() {
  const deleteCredStat = await subject1Identity.getKnownTransaction(
    deleteCredentialStatus
  )
  console.log(
    '(deleteCredentialStatus)The transaction bytes data is: ',
    deleteCredStat
  )
  web3.eth.sendSignedTransaction(deleteCredStat).then(() => {
    const subjectCredentialTransaction =
      transactionFactory.credentialRegistry.getSubjectCredentialStatus(
        web3,
        configData.didSubject1,
        credentialHash.psmhash
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
