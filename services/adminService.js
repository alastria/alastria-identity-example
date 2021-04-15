const { UserIdentity } = require('alastria-identity-lib')
const fs = require('fs')

const keythereum = require('keythereum')

class AdminService {
  constructor(adminKeystorePath) {
    this.keystore = JSON.parse(keyDataAdmin)
  }

  getPrivateKey() {
    let adminPrivateKey = null

    try {
      adminPrivateKey = keythereum.recover(
        configData.addressPassword,
        adminKeyStore
      )
    } catch (error) {
      console.log('ERROR: ', error)
      process.exit(1)
    }

    return adminPrivateKey
  }

  getAdminIdentity(web3, privateKey) {
      return new UserIdentity(
          web3,
          this.getHexadecimalAddress(),
          privateKey
      )
  }

  getHexadecimalAddress() {
      return `0x${this.keystore.address}`
  }
}

export default adminService
