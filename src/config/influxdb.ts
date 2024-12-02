import { InfluxDB } from '@influxdata/influxdb-client'
import 'dotenv/config';

const URL = process.env.INFLUX_URL
const TOKEN = process.env.INFLUX_TOKEN
const ORG = process.env.INFLUX_ORG
const BUCKET = process.env.INFLUX_BUCKET

const influxClient = new InfluxDB({ url: URL, token: TOKEN })
const getWriteApi = (org: string = ORG, bucket: string = BUCKET) => {
    return influxClient.getWriteApi(org, bucket)
}

export { influxClient }

