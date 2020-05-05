const {transactionFactory} = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

if(configData.entity3 == undefined) {
    console.log('You must create an Alastria ID')
    process.exit()
}

console.log("We retrive the current public key for entity3")
let getPubKTx = transactionFactory.publicKeyRegistry.getCurrentPublicKey(web3, configData.entity3)
web3.eth.call(getPubKTx)
    .then(data => {
        let publicKeyAsString = web3.eth.abi.decodeParameters(["string"], data)[0]
        console.log("This is the public key for entity3", publicKeyAsString)

        console.log("Convert the publicKey to byte32 as the input parameter requires this type")
        let publicKeyAsByte32 = web3.utils.sha3(publicKeyAsString)
        let date = 1588612481

        console.log("Check if it is valid for a date")
        transactionFactory.publicKeyRegistry.isPublicKeyValidForDate(web3, configData.entity3, publicKeyAsByte32, date)
            .then(isValid => {
                if (isValid)
                    console.log("The public key is valid for the date " + date);
                else
                    console.log("The public key is NOT valid for the date " + date);
                })
    })
    .catch(function (error) {
        console.log("Something fails", error)
    });
