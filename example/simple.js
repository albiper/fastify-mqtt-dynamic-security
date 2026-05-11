import fastify from 'fastify';
import plugin from '../lib/index.js';
import { connect } from 'mqtt';
const app = new fastify({
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

app.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    // Server is now listening on ${address}
})