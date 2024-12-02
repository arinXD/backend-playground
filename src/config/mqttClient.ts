import mqtt from 'mqtt';

const options = {
    port: 1883,
};

export const mqttClient = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}`, options);

