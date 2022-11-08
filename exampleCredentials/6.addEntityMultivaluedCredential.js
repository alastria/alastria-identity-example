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
  
  const keyDataEntity1 = fs.readFileSync(
    //'../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json'
    '../keystores/eu-issuer.json'
  )
  const keystoreDataEntity1 = JSON.parse(keyDataEntity1)
  
  // Init your blockchain provider
  const myBlockchainServiceIp = configData.nodeURL
  const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))
  
  // ------------------------------------------------------------------------------
  console.log('\n ------ Preparing Entity1 identity ------ \n')
  
  // Some fake data to test
  
  const entity1Keystore = keystoreDataEntity1
  
  let entity1PrivateKey
  try {
    entity1PrivateKey = keythereum.recover(
      configData.addressPassword,
      entity1Keystore
    )
  } catch (error) {
    console.error('ERROR: ', error)
  }

  const entity1Identity = new UserIdentity(
    web3,
    `0x${entity1Keystore.address}`,
    entity1PrivateKey
  )
  
   // Creating Multivalued Credential
  console.log('\n ------ Creating multivalued credential ------ \n')
  
  const jti = configData.jti
  const kidCredential = configData.kidCredential
  //const subjectAlastriaID = configData.subjectAlastriaID
  const subjectAlastriaID = configData.didEuSubject
  //const didEntity1 = configData.didEntity1
  const didEntity1 = configData.didEuIssuer
  const context = configData.context
  const tokenExpTime = configData.tokenExpTime
  const tokenActivationDate = configData.tokenActivationDate
  
  // Multivalued Credential Map (key-->value)
  const credentialSubject = {}
  const credentialKey = configData.credentialKeyFather
  const credentialValue = configData.credentialValueFather
  const credentialSubKey1 = configData.credentialSubKey1
  const credentialSubKey2 = configData.credentialSubKey2
  const credentialSubKey3 = configData.credentialSubKey3
  const credentialSubKey4 = configData.credentialSubKey4
  const credentialSubValue1 = configData.credentialSubValue1
  const credentialSubValue2 = configData.credentialSubValue2
  const credentialSubValue3 = configData.credentialSubValue3
  const credentialSubValue4 = configData.credentialSubValue4
  credentialSubject[credentialKey] = credentialValue
  credentialSubject[credentialKey][credentialSubKey1] = credentialSubValue1
  credentialSubject[credentialKey][credentialSubKey2] = credentialSubValue2
  credentialSubject[credentialKey][credentialSubKey3] = credentialSubValue3
  credentialSubject[credentialKey][credentialSubKey4] = credentialSubValue4
  credentialSubject.levelOfAssurance = 'basic'
  console.log("Multivalued Credential", credentialSubject)

  // End multivalued credential data
  
  // Build multivalued credential with tokensFactory library
  const credential = tokensFactory.tokens.createCredential(
    didEntity1,
    context,
    credentialSubject,
    kidCredential,
    subjectAlastriaID,
    tokenExpTime,
    tokenActivationDate,
    jti
  )
  console.log('The credential1 is: ', credential)
  
  // Sign multivalued credential with tokensFactory library
  const signedJWTCredential = tokensFactory.tokens.signJWT(
    credential,
    entity1PrivateKey
  )
  console.log('The signed token is: ', signedJWTCredential)

  // Create Issuer PSMHash of multivalued credential with tokensFactory library
  const credentialHash = tokensFactory.tokens.PSMHash(
    web3,
    signedJWTCredential,
    didEntity1
  )
  console.log('The Entity1 PSMHash is:', credentialHash)
  fs.writeFileSync(
    `./PSMHashEntity1.json`,
    JSON.stringify({ psmhash: credentialHash, jwt: signedJWTCredential })
  )
  
  // Build addIssuerCredential transaction with transactionFactory library
  function addIssuerCredential() {
    const issuerCredential =
      transactionFactory.credentialRegistry.addIssuerCredential(
        web3,
        credentialHash
      )
    console.log('(addIssuerCredential)The transaction is: ', issuerCredential)
    return issuerCredential
  }
  
  function sendSigned(issuerCredentialSigned) {
    return new Promise((resolve, reject) => {
      web3.eth
        .sendSignedTransaction(issuerCredentialSigned)
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
    const resultIssuerCredential = await addIssuerCredential()
  
    const issuerCredentialSigned = await entity1Identity.getKnownTransaction(
      resultIssuerCredential
    )
    console.log(
      '(addIssuerCredential)The transaction bytes data is: ',
      issuerCredentialSigned
    )
    sendSigned(issuerCredentialSigned).then((receipt) => {
      console.log('RECEIPT:', receipt)
      // Build getIssuerCredentialStatus transaction with transactionFactory library
      const issuerCredentialTransaction =
        transactionFactory.credentialRegistry.getIssuerCredentialStatus(
          web3,
          //configData.didEntity1,
          configData.didEuIssuer,
          credentialHash
        )
      web3.eth
        .call(issuerCredentialTransaction)
        .then((IssuerCredentialStatus) => {
          const result = web3.eth.abi.decodeParameters(
            ['bool', 'uint8'],
            IssuerCredentialStatus
          )
          const credentialStatus = {
            exists: result[0],
            status: result[1]
          }
          console.log('(IssuerCredentialStatus) -----> ', credentialStatus)
        })
    })
  }
  main()