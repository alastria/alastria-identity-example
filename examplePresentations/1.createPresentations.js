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

let keyData = fs.readFileSync('../keystore/keystore.json')
let keystoreData = JSON.parse(keyData)

let Web3 = require('web3')
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const uri = configData.uri

let subject1Keystore = keystoreData.subject1

let subject1PrivateKey
try{
	subject1PrivateKey = keythereum.recover(keystoreData.addressPassword, subject1Keystore)
}catch(error){
	console.log("ERROR: ", error)
}

let subject1Identity = new UserIdentity(web3, `0x${subject1Keystore.address}`, subject1PrivateKey)

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

let signedJWTPresentation = tokensFactory.tokens.signJWT(createPresentation, subject1PrivateKey)
console.log('signedJWTPresentation ------------->', signedJWTPresentation)


const subjectPresentationHash = tokensFactory.tokens.PSMHash(web3, signedJWTPresentation, configData.didSubject1)
console.log("The PSMHashSubject1 is:", subjectPresentationHash);
fs.writeFileSync(`./PSMHashSubject1.json`, JSON.stringify({psmhash: subjectPresentationHash, jwt: signedJWTPresentation}))

const receiverPresentationHash = tokensFactory.tokens.PSMHash(web3, signedJWTPresentation, configData.didEntity1)
console.log("The PSMHashEntity2 is:", receiverPresentationHash);
fs.writeFileSync(`./PSMHashEntity2.json`, JSON.stringify({psmhash: receiverPresentationHash, jwt: signedJWTPresentation}))

let addPresentationTransaction = transactionFactory.presentationRegistry.addSubjectPresentation(web3, subjectPresentationHash, uri)

async function main() {
  let subject1PresentationSigned = await subject1Identity.getKnownTransaction(addPresentationTransaction)
  console.log('(subject1PresentationSigned)The transaction bytes data is: ', subject1PresentationSigned)
  web3.eth.sendSignedTransaction(subject1PresentationSigned)
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