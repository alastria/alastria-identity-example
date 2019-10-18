const {
  transactionFactory,
  UserIdentity,
  tokensFactory
} = require('alastria-identity-lib')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let presentationRawData = fs.readFileSync('./presentations.json')
let presentationData = JSON.parse(presentationRawData)

let keyData = fs.readFileSync('../keystore.json')
let keystoreData = JSON.parse(keyData)

let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const uri = configData.uri

let identityKeystore = keystoreData.identityKeystore

let identityPrivateKey
try {
  identityPrivateKey = keythereum.recover(keystoreData.addressPassword, identityKeystore)
} catch (error) {
  console.log("ERROR: ", error)
}

let createPresentation = tokensFactory.tokens.createPresentation(presentationData.didIssuer,
  presentationData.didSubject, 
  presentationData.credentials, 
  presentationData.timeExp, 
  presentationData.timeNbf, 
  presentationData.jti)
console.log('createPresentation ---------->', createPresentation)


let signedJWTPresentation = tokensFactory.tokens.signJWT(createPresentation, identityPrivateKey)
console.log('signedJWTPresentation ------------->', signedJWTPresentation)

let subjectIdentity = new UserIdentity(web3, `0x${identityKeystore.address}`, identityPrivateKey)

const subjectPresentationHash = tokensFactory.tokens.PSMHash(web3, signedJWTPresentation, presentationData.didIsssuer)
console.log("The PSMHash is:", subjectPresentationHash);
fs.writeFileSync(`./PSMHash.json`, JSON.stringify({psmhash: subjectPresentationHash, jwt: signedJWTPresentation}))


let addPresentationTransaction = transactionFactory.presentationRegistry.addSubjectPresentation(web3, subjectPresentationHash, uri)


async function main() {
  let subjectPresentationSigned = await subjectIdentity.getKnownTransaction(addPresentationTransaction)
  console.log('(subjectPresentationSigned)The transaction bytes data is: ', subjectPresentationSigned)
  web3.eth.sendSignedTransaction(subjectPresentationSigned)
  .on('hash', txHash => {
    console.log('txHash ---------->', txHash)
  })
  .on('receipt', receipt => {
    console.log('Receipt --------->', receipt)
  })
  .on('error', error => {
    console.log('ERROR ---------->', error)
  })
}

main()