const mongoose = require("mongoose")

const SavingSchema = new mongoose.Schema(
    {
        device_id: {
            type: mongoose.Schema.Types.Number,
            required: true,
            ref: "Device",
        },
        timestamp: {
            type: Date,
            required: true
        },
        device_timestamp: {
            type: Date,
            required: true
        },
        carbon_saved: {
            type: Number,
            required: true
        },
        fueld_saved: {
            type: Number,
            required: true
        }
    }
)

module.exports = mongoose.model("Saving", SavingSchema)
