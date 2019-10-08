let any = require('jsontokens')
const {transactionFactory, UserIdentity, tokensFactory} = require('alastria-identity-lib')

// Data
const rawPublicKey = '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479'
const rawPrivateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
const tokenPayload = {
 "iss": "joe",
 "exp": 1300819380,
 "http://example.com/is_root": true
}
// End data

console.log("---- signedJWT ----")

console.log("\tFunction arguments: Token payload, Raw Public Key")
console.log("\t\tToken payload:\n", tokenPayload)
console.log("\t\tRaw Public key:", rawPublicKey)

const signedJWT = tokensFactory.tokens.signJWT(tokenPayload, rawPrivateKey)
console.log('\tThe signed JWT is: ', signedJWT)

console.log("\n---- decodeJWT ----")

console.log("\tFunction arguments: signed JWT")
console.log("\t\tSigned JWT:", signedJWT)

let decodedJWT = tokensFactory.tokens.decodeJWT(signedJWT)
console.log('\tThe decoded token is: \n', decodedJWT)

console.log("\n---- verifyJWT ----")

console.log("\tFunction arguments: signed JWT, Raw Public Key")
console.log("\t\tSigned JWT:", signedJWT)
console.log("\t\tRaw Public key:", rawPublicKey)

let verifyJWT = tokensFactory.tokens.verifyJWT(signedJWT, rawPublicKey)
console.log('\tIs the signedJWT verified?', verifyJWT)

// Data
let context = "https://w3id.org/did/v1"
let userPublicKey = "AE2309349218937HASKHIUE9287432"
let didIsssuer = "did:ala:quor:telsius:0x12345"
let providerURL = "https://regular.telsius.blockchainbyeveris.io:2000"
let callbackURL = "https://serviceprovider.alastria.blockchainbyeveris.io/api/login/"
let alastriaNetId = "Alastria network"
let tokenExpTime = 1563783392
let tokenActivationDate = 1563782792
let jsonTokenId = "ze298y42sba"
// End data

console.log("\n---- createAlastriaToken ----")

console.log("\tFunction arguments: Issuer DID, Provider URL, Callback URL, Alastria Net ID, Token Exp Time, nbf, jti")
console.log("\t\tIssuer DID:", didIsssuer)
console.log("\t\tProvider URL:", providerURL)
console.log("\t\tCallback URL:", callbackURL)
console.log("\t\tAlastria Net ID:", alastriaNetId)
console.log("\t\tToken Exp Time:", tokenExpTime)
console.log("\t\tnbf:", tokenActivationDate)
console.log("\t\tjti:", jsonTokenId)

const alastriaToken = tokensFactory.tokens.createAlastriaToken(didIsssuer, providerURL, callbackURL, alastriaNetId, tokenExpTime, tokenActivationDate, jsonTokenId)
console.log('\tThe Alastria token is: \n', alastriaToken)

// Signing the AlastriaToken
let signedAT = tokensFactory.tokens.signJWT(alastriaToken, rawPrivateKey)
//console.log('The signed Alastria token is: ', signedAT)

console.log("\n---- createAlastriaSesion ----")

console.log("\tFunction arguments: Context, Issuer DID, User Public Key, Signed Alastria Token, Token Exp Time, nbf, jti")
console.log("\t\tContext:", context)
console.log("\t\tIssuer DID:", didIsssuer)
console.log("\t\tUser Public Key:", userPublicKey)
console.log("\t\tSigned Alastria Token:", signedJWT)
console.log("\t\tToken Exp Time:", tokenExpTime)
console.log("\t\tnbf:", tokenActivationDate)
console.log("\t\tjti:", jsonTokenId)

const alastriaSession = tokensFactory.tokens.createAlastriaSession(context, didIsssuer, userPublicKey, signedAT, tokenExpTime, tokenActivationDate, jsonTokenId)
console.log('\tThe Alastria session is:\n', alastriaSession)

// Data
let jti = "https://www.metrovacesa.com/alastria/credentials/3734";
let kidCredential = "did:ala:quor:redt:QmeeasCZ9jLbXueBJ7d7csxhb#keys-1";
let subjectAlastriaID = "did:alastria:quorum:redt:QmeeasCZ9jLbXueBJ7d7csxhb";
let credentialSubject = {};
let credentialKey ="StudentID"
let credentialValue ="11235813"
credentialSubject[credentialKey]=credentialValue;
credentialSubject["levelOfAssurance"]="basic";
// End data

console.log("\n---- createCredential ----")

console.log("\tFunction arguments: KID Credential, Issuer DID, Subject DID, Context, Credential Subject, Token Exp Time, nbf, jti")
console.log("\t\tKID Credential:", context)
console.log("\t\tIssuer DID:", didIsssuer)
console.log("\t\tUser Subject DID:", subjectAlastriaID)
console.log("\t\tContext:", context)
console.log("\t\tCredential Subject:\n", credentialSubject)
console.log("\t\tToken Exp Time:", tokenExpTime)
console.log("\t\tnbf:", tokenActivationDate)
console.log("\t\tjti:", jti)

const credential1 = tokensFactory.tokens.createCredential(kidCredential, didIsssuer, subjectAlastriaID, context, credentialSubject, tokenExpTime, tokenActivationDate, jti)
console.log('\nThe credential1 is: ', credential1)