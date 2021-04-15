const { transactionFactory } = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')

const rawdata = fs.readFileSync(process.env.CONFIGURATION_PATH || '../configuration.json')
const configData = JSON.parse(rawdata)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

async function main() {
  console.log('\n ------ Example of asking for isIdentityIssuer ------ \n')
  const isIssuer = await transactionFactory.identityManager.isIdentityIssuer(
    web3,
    configData.didEntity1
  )
  console.log('isIssuerTransaction', isIssuer)
  web3.eth.call(isIssuer).then((isIssuerStatus) => {
    const result = web3.eth.abi.decodeParameter('bool', isIssuerStatus)
    console.log('isIssuer? ----->', result)
  })
}

main()
