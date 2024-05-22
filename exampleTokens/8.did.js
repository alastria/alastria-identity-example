const { tokensFactory } = require('alastria-identity-lib')
const { tests } = require('alastria-identity-JSON-objects/tests')
const fs = require('fs')

//Preparing to read configuration.json
const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

// **************************************************************************************************
// Starting reading/calculating DATA declared in configuration.json used to create the Alastria Token
const network = configData.network
const networkID = configData.networkID
const proxyAddress = configData.entity1
// Same proxy but other network information
const otherNetwork = "besu"
const otherNetworkId = "redB"
// Ending DATA reading/calculating
// **************************************************************************************************

// Creating DID-T
console.log('\t 1 - Creating DID redT\n')
const didT = tokensFactory.tokens.createDID(network, proxyAddress, networkID)
console.log('\nThe DID-T is: \n', didT)

// Validating DID-T
console.log('\t 2 - Validating DID redT\n')
tests.dids.validateDID(didT)

// Creating DID-B
console.log('\t 3 - Creating DID redB\n')
const didB = tokensFactory.tokens.createDID(otherNetwork, proxyAddress, otherNetworkId)
console.log('\nThe DID-B is: \n', didB)

// Validating DID-B 
console.log('\t 4 - Validating DID redB\n')
tests.dids.validateDID(didB)
