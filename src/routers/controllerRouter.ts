
import { Router, Request, Response } from 'express';
import { mqttClient } from "../config/mqttClient.js";
import { topics } from '../config/mqttTopics.js';
import { Point } from '@influxdata/influxdb-client'
import { influxClient } from "../config/influxdb.js"

export const controllerRouter = Router();

controllerRouter.post("/home/light/:lid/:mode", (req: Request, res: Response) => {
    const modes = {
        "1": "on",
        "0": "off"
    }
    const { homeLight } = topics
    const { lid, mode } = req.params;
    const lightMode = modes[mode]
    const lightID = String(lid).toLocaleUpperCase()

    if (!lightMode) {
        return res.status(406).json({
            status: 406,
            message: `Status not allowed.`
        });
    }

    mqttClient.publish(homeLight, mode, (err) => {
        if (err) {
            return res.status(500).json({
                status: 500,
                message: `Failed to published: "${mode}"`
            });
        }
        console.log(`Published: "${mode}"`);
        const writeApi = influxClient.getWriteApi("grandline", "controllers")
        const point = new Point('light_status')
            .tag(`light_id`, lightID)
            .intField('status', mode)

        console.log(` ${point}`)
        writeApi.writePoint(point)
    });

    return res.json({
        status: 200,
        message: `Turn ${lightMode} light ID: ${lightID}.`
    });
});