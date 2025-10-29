const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

module.exports = async () => {
    const mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()
    await mongoose.connect(uri)

    // On shutdown:
    //   await mongoose.disconnect()
    //   await mongod.stop()
}