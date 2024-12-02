import { Router, Request, Response } from 'express';
import { Point } from '@influxdata/influxdb-client'
import { influxClient } from "../config/influxdb.js"
import { getRandomNumber } from "../module/utils.js";

export const sensorRouter = Router();

sensorRouter.get("/temperatures/:bucket", async (req: Request, res: Response) => {
    const { bucket } = req.params
    const queryApi = influxClient.getQueryApi("grandline")
    const fluxQuery = `from(bucket:"${bucket}") |> range(start: 0) |> filter(fn: (r) => r._measurement == "temperature")`
    const temperatures = []

    for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
        const {
            _time,
            _measurement,
            location,
            sensor_id,
            _field,
            _value
        } = tableMeta.toObject(values)

        const log = `${_time} ${_measurement} (${sensor_id}): ${_field}=${_value}`
        console.log(log)

        const result = {
            _time,
            _measurement,
            sensor_id,
            _field,
            _value 
        }

        temperatures.push(result)
    }
    return res.json({
        status: 200,
        data: {
            temperatures
        }
    });
})

sensorRouter.post("/temperatures/:tempName/:tempVal", (req: Request, res: Response) => {
    const { tempName, tempVal } = req.params
    const writeApi = influxClient.getWriteApi("grandline", "sensors")
    const point = new Point('temperature')
        .tag(`sensor_id`, tempName)
        .floatField('value', getRandomNumber())

    console.log(` ${point}`)
    writeApi.writePoint(point)

    return res.json({
        status: 200,
        message: `Write point ${point}`
    });
})