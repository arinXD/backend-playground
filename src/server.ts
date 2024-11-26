import express, { Application, Request, Response } from "express";
import "dotenv/config";
import apolloServer from "./config/apolloServer.js";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";

const app: Application = express()
const PORT = process.env.PORT || 9000

app.use(cors({
    credentials: true,
    origin: [
        "https://it-track-client.vercel.app",
        "http://localhost:3000",
    ]
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
        message: "API is running."
    })
})

startApolloServer()

app.listen(PORT, () => {
    console.log(`Start server http://localhost:${PORT}`);
})