import "dotenv/config";
import express, { Application, Request, Response } from "express";
import apolloServer from "./config/apolloServer.js";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import { mqttClient } from "./config/mqttClient.js";
import { sensorRouter } from "./routers/sensorRouter.js"
import { controllerRouter } from "./routers/controllerRouter.js";

async function startApolloServer() {
    await apolloServer.start()
    console.log("Start Apollo Server http://localhost:8086");
    app.use("/graphql", expressMiddleware(apolloServer))
}

function initMqttClient() {

    mqttClient.on('connect', () => {
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

    mqttClient.on('message', (topic, payload) => {
        console.log(`Received Message: "${payload.toString()}"`)
    })

    mqttClient.on('error', (error) => {
        console.error('MQTT Connection Error:', error);
    });
}

const app: Application = express()
const PORT = process.env.PORT || 9000

app.use(cors({
    credentials: true,
}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
    return res.json({
        status: 200,
        message: "API is running..."
    })
})

app.use("/api/v1/controllers", controllerRouter)
app.use("/api/v1/sensors", sensorRouter)

app.listen(PORT, async () => {
    console.log(`Start server http://localhost:${PORT}`);
    startApolloServer()
    initMqttClient()
})