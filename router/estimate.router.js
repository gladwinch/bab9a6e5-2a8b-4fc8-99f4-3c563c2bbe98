const router = require('express').Router()
// const Device = require('../models/device.model')
const Saving = require('../models/saving.model')

router.get('/total-savings', async (req, res) => {
    try {
        const result = await Saving.aggregate([
            // 1) normalize numeric fields once
            {
                $project: {
                    device_timestamp: 1,
                    carbon: { $toDouble: "$carbon_saved" },
                    fuel: { $toDouble: "$fueld_saved" }
                }
            },

            {
                $facet: {
                    // 2) overall totals across all docs
                    totals: [
                        {
                            $group: {
                                _id: null,
                                carbon_saved: { $sum: "$carbon" },
                                fueld_saved: { $sum: "$fuel" }
                            }
                        }
                    ],

                    monthly_avgs: [
                        // sum per calendar month
                        {
                            $group: {
                                _id: {
                                    year: { $year: "$device_timestamp" },
                                    month: { $month: "$device_timestamp" }
                                },
                                monthly_carbon: { $sum: "$carbon" },
                                monthly_fuel: { $sum: "$fuel" }
                            }
                        },
                        // average those monthly sums
                        {
                            $group: {
                                _id: null,
                                avg_monthly_carbon_saved: { $avg: "$monthly_carbon" },
                                avg_monthly_fueld_saved: { $avg: "$monthly_fuel" },
                                months_count: { $sum: 1 }
                            }
                        }
                    ]
                }
            },

            // 4) flatten & round
            {
                $project: {
                    totals: { $arrayElemAt: ["$totals", 0] },
                    monthly_avgs: { $arrayElemAt: ["$monthly_avgs", 0] }
                }
            },
            {
                $project: {
                    _id: 0,
                    carbon_saved: { $round: ["$totals.carbon_saved", 1] },
                    fueld_saved: { $round: ["$totals.fueld_saved", 1] },
                    avg_monthly_carbon_saved: { $round: ["$monthly_avgs.avg_monthly_carbon_saved", 1] },
                    avg_monthly_fueld_saved: { $round: ["$monthly_avgs.avg_monthly_fueld_saved", 1] },
                    months_count: "$monthly_avgs.months_count"
                }
            }
        ]);

        res.json(result[0] || {
            carbon_saved: 0,
            fueld_saved: 0,
            avg_monthly_carbon_saved: 0,
            avg_monthly_fueld_saved: 0,
            months_count: 0
        });
    } catch (err) {
        console.error("Total savings aggregation error:", err);
        res.status(500).json({ error: "Internal error" });
    }
});

// GET /api/estimate/savings?start=ISODate&end=ISODate
router.get('/savings', async (req, res) => {
    try {
        const { start, end, deviceId } = req.query;
        if (!start || !end) {
            return res.status(400).json({ error: "Provide 'start' and 'end' in ISO format" });
        }

        const match = {
            device_timestamp: { $gte: new Date(start), $lte: new Date(end) }
        };
        if (deviceId) match.device_id = Number(deviceId);

        // aggregation pipeline
        const result = await Saving.aggregate([
            { $match: match },

            {
                $project: {
                    device_timestamp: 1,
                    carbon_saved: { $toDouble: "$carbon_saved" },
                    fueld_saved: { $toDouble: "$fueld_saved" },
                    total_saved: {
                        $add: [
                            { $toDouble: "$carbon_saved" },
                            { $toDouble: "$fueld_saved" }
                        ]
                    }
                }
            },

            {
                $facet: {
                    overall: [
                        {
                            $group: {
                                _id: null,
                                total_saved: { $sum: "$total_saved" },
                                carbon_saved: { $sum: "$carbon_saved" },
                                fueld_saved: { $sum: "$fueld_saved" }
                            }
                        },
                        { $project: { _id: 0 } }
                    ],

                    monthly: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: "$device_timestamp" },
                                    month: { $month: "$device_timestamp" }
                                },
                                total_saved: { $sum: "$total_saved" },
                                carbon_saved: { $sum: "$carbon_saved" },
                                fueld_saved: { $sum: "$fueld_saved" }
                            }
                        },
                        {
                            $addFields: {
                                label: {
                                    $let: {
                                        vars: {
                                            months: [
                                                "Jan","Feb","Mar","Apr","May","Jun",
                                                "Jul","Aug","Sep","Oct","Nov","Dec"
                                            ]
                                        },
                                        in: {
                                            $concat: [
                                                { $arrayElemAt: [ "$$months", { $subtract: [ "$_id.month", 1 ] } ] },
                                                " ",
                                                { $toString: "$_id.year" }
                                            ]
                                        }
                                    }
                                },
                                monthDate: {
                                    $dateFromParts: {
                                        year: "$_id.year",
                                        month: "$_id.month",
                                        day: 1
                                    }
                                }
                            }
                        },
                        { $sort: { monthDate: 1 } },
                        { $unset: "monthDate" },              // <-- remove it cleanly
                        {
                            $project: {
                                _id: 0,
                                month: "$label",                  // 'Sep 2023' style
                                total_saved: 1,
                                carbon_saved: 1,
                                fueld_saved: 1
                            }
                        }
                    ]
                }
            },

            {
                $project: {
                    overall: {
                        $ifNull: [
                            { $arrayElemAt: ["$overall", 0] },
                            { total_saved: 0, carbon_saved: 0, fueld_saved: 0 }
                        ]
                    },
                    monthly: 1
                }
            }
        ]);

        const { overall, monthly } = result?.[0] || { overall: {}, monthly: [] };

        res.json({
            range: { start, end, deviceId: deviceId ? Number(deviceId) : undefined },
            overall,
            monthly
        });
    } catch (err) {
        console.error("Savings aggregation error:", err);
        res.status(500).json({ error: "Internal error" });
    }
});


module.exports = router