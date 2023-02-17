const { tokensFactory } = require('alastria-identity-lib')
const { tests } = require('alastria-identity-JSON-objects/tests')
const fs = require('fs')
const keythereum = require('keythereum')

//Preparing to read configuration.json
const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

const rawDataSignedObjects = fs.readFileSync('./SignedObjects.json')
const configDataSignedObjects = JSON.parse(rawDataSignedObjects)

// **************************************************************************************************
// Starting reading/calculating DATA declared in configuration.json used to create the Alastria Token
const signedAT = configDataSignedObjects.signedAT
const jwk = configData.firstIdentityPubk //header.JWK
// Ending DATA reading/calculating
// **************************************************************************************************

// Decode AlastriaToken
console.log('\t 1 - Decoding the Alastria Token (AT)\n')
const decodedAT = tokensFactory.tokens.decodeJWT(signedAT)
console.log('\nThe decoded token is: \n', decodedAT)

// Verifying AlastriaToken
console.log('\t 2 - Verifying the Alastria Token (AT)\n')
// '04' means uncompressed key (more info at https://github.com/indutny/elliptic/issues/138)
const verifyAT = tokensFactory.tokens.verifyJWT(
  signedAT,
  '04' + jwk.substr(2)
)
console.log('\nIs the signedJWT verified? \n', verifyAT)