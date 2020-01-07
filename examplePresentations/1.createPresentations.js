const {
  transactionFactory,
  UserIdentity,
  tokensFactory
} = require('alastria-identity-lib')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let presentationRawData = fs.readFileSync('./mockPresentation.json')
let presentationData = JSON.parse(presentationRawData)

let keyData = fs.readFileSync('../keystore.json')
let keystoreData = JSON.parse(keyData)

let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const uri = configData.uri

let subjectKeystore = keystoreData.subjectKeystore

let subjectPrivateKey
try {
  subjectPrivateKey = keythereum.recover(keystoreData.addressPassword, subjectKeystore)
} catch (error) {
  console.log("ERROR: ", error)
}
let createPresentation = tokensFactory.tokens.createPresentation(presentationData["credentials"][0]["header"]["kid"],
presentationData["credentials"][0]["payload"]["iss"], 
presentationData["credentials"][0]["payload"]["aud"],
presentationData["credentials"][0]["payload"]["vp"]["@context"], 
presentationData["credentials"][0]["payload"]["vp"]["verifiableCredential"], 
presentationData["credentials"][0]["payload"]["vp"]["procUrl"],
presentationData["credentials"][0]["payload"]["vp"]["procHash"],
presentationData["credentials"][0]["payload"]["exp"],
presentationData["credentials"][0]["payload"]["nbf"],
presentationData["credentials"][0]["payload"]["jti"])
console.log('createPresentation ---------->', createPresentation)

let signedJWTPresentation = tokensFactory.tokens.signJWT(createPresentation, subjectPrivateKey)
console.log('signedJWTPresentation ------------->', signedJWTPresentation)

let subjectIdentity = new UserIdentity(web3, `0x${subjectKeystore.address}`, subjectPrivateKey)
const subjectPresentationHash = tokensFactory.tokens.PSMHash(web3, signedJWTPresentation, configData.didSubject)
console.log("The PSMHashSubject is:", subjectPresentationHash);
fs.writeFileSync(`./PSMHashSubject.json`, JSON.stringify({psmhash: subjectPresentationHash, jwt: signedJWTPresentation}))

const receiverPresentationHash = tokensFactory.tokens.PSMHash(web3, signedJWTPresentation, configData.didIsssuer)
console.log("The PSMHashReceiver is:", receiverPresentationHash);
fs.writeFileSync(`./PSMHashReceiver.json`, JSON.stringify({psmhash: receiverPresentationHash, jwt: signedJWTPresentation}))

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
