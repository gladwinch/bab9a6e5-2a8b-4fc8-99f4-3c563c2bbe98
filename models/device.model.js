const mongoose = require("mongoose")

const DeviceSchema = new mongoose.Schema(
    {
        device_id: {
            type: Number,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        timezone: {
            type: String,
            required: true
        }
    }
)

module.exports = mongoose.model("Device", DeviceSchema)
