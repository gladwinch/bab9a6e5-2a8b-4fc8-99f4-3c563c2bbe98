const fs = require("fs");
const { parse } = require("csv-parse");
const Device = require("../models/device.model")
const Saving = require("../models/saving.model")

async function readCsv(filePath) {
    const parser = fs
        .createReadStream(filePath, "utf8")
        .pipe(parse({
            columns: true,
            skip_empty_lines: true,
            bom: true,
            cast: true,
        }));

    const rows = [];
    for await (const record of parser) {
        rows.push(record);
    }
    return rows;
}

async function insertData() {
    try {
        // 1️ insert device data
        const devices = await readCsv("./data/devices.csv")
        await Device.bulkWrite(
            devices.map(d => ({
                insertOne: { document: d }
            })),
            { ordered: false }
        );
        console.log(`Inserted ${devices.length} devices`)

        // 2 insert savings data in batches
        const savings = await readCsv("./data/device-saving.csv")
        console.log(`Total savings records: ${savings.length}`)

        const BATCH_SIZE = 50000;
        for (let i = 0; i < savings.length; i += BATCH_SIZE) {
            const batch = savings.slice(i, i + BATCH_SIZE)
            const ops = batch.map(doc => ({
                insertOne: { document: doc }
            }))

            try {
                // console.log('ops:', JSON.stringify(ops, null, 2))
                const d = await Saving.bulkWrite(ops, { ordered: false })
                // console.log('d:', JSON.stringify(d.mongoose.validationErrors, null, 2) )
                console.log(`Inserted batch ${i / BATCH_SIZE + 1}: ${batch.length} records`)
            } catch (error) {
                console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error)
            }
        }

        console.log("All savings data inserted successfully!")
    } catch (err) {
        console.error(`Error inserting data:`, err)
    }
}

module.exports = insertData