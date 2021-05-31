const { transactionFactory } = require('alastria-identity-lib')
const fs = require('fs')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)
const subjectPresentationHashData = fs.readFileSync(`./PSMHashSubject1.json`)
const subjectPresentationHash = JSON.parse(subjectPresentationHashData)
const entityPresentationHashData = fs.readFileSync(`./PSMHashEntity2.json`)
const entityPresentationHash = JSON.parse(entityPresentationHashData)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const getPresentationStatusExample = async () => {
  const subject1PresentationStatus = await getSubject1PresentationStatus()
  const entity2PresentationStatus = await getEntity2PresentationStatus()

  const globalStatus =
    transactionFactory.presentationRegistry.getPresentationStatus(
      web3,
      subject1PresentationStatus.status,
      entity2PresentationStatus.status
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
          console.log('Received =>', resultStatus)
          break
        case 2:
          console.log('AskDeletion =>', resultStatus)
          break
        case 3:
          console.log('DeletionConfirmation =>', resultStatus)
          break
      }
    })
    .catch((error) => {
      console.error(`Error ${error}`)
      process.exit(1)
    })
}

const getSubject1PresentationStatus = async () => {
  return new Promise((resolve, reject) => {
    const subject1PresentationStatusCall =
      transactionFactory.presentationRegistry.getSubjectPresentationStatus(
        web3,
        configData.didSubject1,
        subjectPresentationHash.psmhash
      )
    web3.eth.call(subject1PresentationStatusCall).then((subjectResult) => {
      const subjectResultStatus = web3.eth.abi.decodeParameters(
        ['bool', 'uint8'],
        subjectResult
      )
      const subject1PresentationStatus = {
        exist: subjectResultStatus[0],
        status: subjectResultStatus[1]
      }
      resolve(subject1PresentationStatus)
    })
  })
}

const getEntity2PresentationStatus = async () => {
  return new Promise((resolve, reject) => {
    const entity2PresentationStatusCall =
      transactionFactory.presentationRegistry.getReceiverPresentationStatus(
        web3,
        configData.didEntity2,
        entityPresentationHash.psmhash
      )

    web3.eth.call(entity2PresentationStatusCall).then((entityResult) => {
      const entityResultStatus = web3.eth.abi.decodeParameters(
        ['bool', 'uint8'],
        entityResult
      )
      const entity2PresentationStatus = {
        exist: entityResultStatus[0],
        status: entityResultStatus[1]
      }
      resolve(entity2PresentationStatus)
    })
  })
}

getPresentationStatusExample()
