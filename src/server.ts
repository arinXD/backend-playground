import express, { Application, Request, Response } from "express";
import "dotenv/config";
import apolloServer from "./config/apolloServer.js";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import mqtt from 'mqtt';
import { Point } from '@influxdata/influxdb-client'
import 'dotenv/config'
import { influxClient } from "./config/influxdb.js"
import { getRandomNumber } from "./module/utils.js";

const MQTT_TOPIC = "home/light"
const options = {
    port: 1883,
};

const client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}`, options);

client.on('connect', () => {
    console.log(`Connected to MQTT Broker: ${process.env.MQTT_BROKER}`)

    // client.subscribe([MQTT_TOPIC], () => {
    //     console.log(`Subscribe to topic "${MQTT_TOPIC}"`)
    // })

    // client.publish(MQTT_TOPIC, 'Welcome to Light toppic', { qos: 0, retain: false }, (error) => {
    //     if (error) {
    //         console.error(error)
    //     }
    // })
})

client.on('message', (topic, payload) => {
    console.log(`Received Message: "${payload.toString()}"`)
})

client.on('error', (error) => {
    console.error('MQTT Connection Error:', error);
});

const app: Application = express()
const PORT = process.env.PORT || 9000

app.use(cors({
    credentials: true,
}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const startApolloServer = async () => {
    await apolloServer.start()
    app.use("/graphql", expressMiddleware(apolloServer))
}

app.get("/", (req: Request, res: Response) => {
    return res.json({
        status: 200,
        message: "API is running..."
    })
})

app.get("/home/light/:mode", (req: Request, res: Response) => {
    const modes = {
        "1": "on",
        "0": "off"
    }
    const { mode } = req.params;
    client.publish(MQTT_TOPIC, mode, (err) => {
        if (err) {
            return res.status(500).json({
                status: 500,
                message: `Failed to published: "${mode}"`
            });
        }
        console.log(`Published: "${mode}"`);
    });

    return res.json({
        status: 200,
        message: `Turn ${modes[mode]} light.`
    });
});

app.get("/sensors/temperatures/:bucket", async (req: Request, res: Response) => {
    const { bucket } = req.params
    const queryApi = influxClient.getQueryApi("grandline")
    const fluxQuery = `from(bucket:"${bucket}") |> range(start: 0) |> filter(fn: (r) => r._measurement == "temperature")`
    const result = []
    for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
        const o = tableMeta.toObject(values)
        console.log(
            `${o._time} ${o._measurement} in '${o.location}' (${o.sensor_id}): ${o._field}=${o._value}`
        )
        result.push(o._value)
    }
    return res.json({
        status: 200,
        data: {
            temperatures: result
        }
    });
})

app.post("/sensors/temperatures/:tempName/:tempVal", (req: Request, res: Response) => {
    const { tempName, tempVal } = req.params
    const writeApi = influxClient.getWriteApi("grandline", "storage")
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

startApolloServer()

app.listen(PORT, () => {
    console.log(`Start server http://localhost:${PORT}`);
})