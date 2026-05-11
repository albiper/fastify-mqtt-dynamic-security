import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import { listQuerySchema } from '../../types/mqtt.js';

export default async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: {
            tags: ['mqtt_groups'],
            querystring: listQuerySchema,
            response: {
                200: Type.Array(Type.String())
            }
        }
    }, async (request: FastifyRequest<{ Querystring: Static<typeof listQuerySchema> }>, reply: FastifyReply) => {
        const { totalCount, limit, offset } = request.query;
        const groups = await fastify.mqttDynamicSecurity.listGroups(limit, offset);

        if (totalCount) {
            reply.header('X-Total-Count', groups.totalCount)
        }

        return reply.code(200).send(groups.groups);
    });
}