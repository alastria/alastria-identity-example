const Web3 = require('web3')


class AccountService {
  constructor(url) {
      this.url = url
      this.connection = null
  }

  initConnection() {
    this.connection = new Web3(new Web3.providers.HttpProvider(this.url))
    return this.connection
  }

  hasValidKeys(configuration, requiredKeys) {
      return requiredKeys.every(item => configuration.hasOwnProperty(item))
  }

  async unlock(userAddress, userPassword) {
    return await this.connection.eth.personal.unlockAccount(
        userAddress,
        userPassword,
        500
    )
  }
}

export default AccountService
