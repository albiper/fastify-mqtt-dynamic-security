import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { listQuerySchema } from '../../types/mqtt.js';

export default async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: {
            tags: ['mqtt_clients'],
            querystring: listQuerySchema,
            response: {
                200: Type.Array(Type.String())
            }
        }
    }, async (request: FastifyRequest<{ Querystring: Static<typeof listQuerySchema> }>, reply: FastifyReply) => {
        const { totalCount, limit, offset } = request.query;
        const clients = await fastify.mqttDynamicSecurity.listClients(limit, offset);

        if (totalCount) {
            reply.header('X-Total-Count', clients.totalCount)
        }

        return reply.code(200).send(clients.clients);
    });
}