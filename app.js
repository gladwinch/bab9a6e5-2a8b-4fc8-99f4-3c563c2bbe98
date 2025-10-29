
const connectDb = require('./db')
const express = require('express')
const cors = require('cors')
const routers = require('./router')
const insertData = require('./db/insertData')

const main = async () => {
    // app configuration
    const app = express()
    app.use(cors({
        origin: '*',
        credentials: true
    }))

    // serve static files from ui/dist
    app.use(express.static('./ui/dist'))

    await connectDb()
    await insertData()

    // static & routers
    app.use('/api', routers)
    app.get('/ping', (_req, res) => res.send('pong from api'))

    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

main()