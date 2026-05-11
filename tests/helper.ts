import fastify from "fastify";
import plugin from '../src/index.js';
import { connect } from "mqtt";
import { Test } from "tap";

export const buildServer = (t: Test) => {

    const app = fastify({
        logger: true
    });

    const client = connect(process.env.MQTT_HOST ?? 'mqtt://localhost:1883', {
        username: process.env.MQTT_USERNAME ?? 'admin',
        password: process.env.MQTT_PASSWORD ?? 'password',
        protocolVersion: 5,
    });

    client.on('error', (err) => {
        throw err;
    })

    app.register(plugin, {
        mqttClient: client
    });

    t.teardown(async () => {
        await app.close();
        client.end();
    })

    return app;
}