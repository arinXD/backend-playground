import express, { Application, Request, Response } from "express";
import "dotenv/config";
import apolloServer from "./config/apolloServer.js";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import mqtt from 'mqtt';
import 'dotenv/config'

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

startApolloServer()

app.listen(PORT, () => {
    console.log(`Start server http://localhost:${PORT}`);
})