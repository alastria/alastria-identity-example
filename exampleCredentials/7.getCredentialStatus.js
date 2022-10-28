const { transactionFactory } = require('alastria-identity-lib')
const fs = require('fs')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)
const subjectCredentialHashData = fs.readFileSync(`./PSMHashSubject1.json`)
const subjectCredentialHash = JSON.parse(subjectCredentialHashData)
const entityCredentialHashData = fs.readFileSync(`./PSMHashEntity1.json`)
const entityCredentialHash = JSON.parse(entityCredentialHashData)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const getPresentationStatusExample = async () => {
  const subjectCredentialStatus = await getSubject1CredentialStatus()
  const entity1CredentialStatus = await getEntity1CredentialStatus()

  const globalStatus =
    transactionFactory.presentationRegistry.getPresentationStatus(
      web3,
      subjectCredentialStatus.status,
      entity1CredentialStatus.status
    )

  web3.eth
    .call(globalStatus)
    .then((result) => {
      const resultStatus = web3.utils.hexToNumber(result)
      switch (resultStatus) {
        case 0:
          console.log('Valid =>', resultStatus)
          break
        case 1:
          console.log('askIssuer =>', resultStatus)
          break
        case 2:
          console.log('Revoked =>', resultStatus)
          break
        case 3:
          console.log('DeletedBySubject =>', resultStatus)
          break
      }
    })
    .catch((error) => {
      console.error(`Error ${error}`)
      process.exit(1)
    })
}

const getSubject1CredentialStatus = async () => {
  return new Promise((resolve, reject) => {
    const subject1CredentialStatusCall =
      transactionFactory.credentialRegistry.getSubjectCredentialStatus(
        web3,
        configData.didSubject1,
        subjectCredentialHash.psmhash
      )
    web3.eth.call(subject1CredentialStatusCall).then((subjectResult) => {
      const subjectResultStatus = web3.eth.abi.decodeParameters(
        ['bool', 'uint8'],
        subjectResult
      )
      const subject1CredentialStatus = {
        exist: subjectResultStatus[0],
        status: subjectResultStatus[1]
      }
      resolve(subject1CredentialStatus)
    })
  })
}

const getEntity1CredentialStatus = async () => {
  return new Promise((resolve, reject) => {
    const entity1CredentialStatusCall =
      transactionFactory.credentialRegistry.getIssuerCredentialStatus(
        web3,
        configData.didEntity1,
        entityCredentialHash.psmhash
      )

    web3.eth.call(entity1CredentialStatusCall).then((entityResult) => {
      const entityResultStatus = web3.eth.abi.decodeParameters(
        ['bool', 'uint8'],
        entityResult
      )
      const entity1CredentialStatus = {
        exist: entityResultStatus[0],
        status: entityResultStatus[1]
      }
      resolve(entity1CredentialStatus)
    })
  })
}

getPresentationStatusExample()