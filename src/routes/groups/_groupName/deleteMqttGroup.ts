import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const paramsSchema = Type.Object({
    groupName: Type.String()
})

export default async (fastify: FastifyInstance) => {
    fastify.delete('/', {
        schema: {
            tags: ['mqtt_groups'],
            params: paramsSchema,
            response: {
                204: Type.Null()
            }
        }
    }, async (request: FastifyRequest<{ Params: Static<typeof paramsSchema> }>, reply: FastifyReply) => {
        const { groupName } = request.params;
        await fastify.mqttDynamicSecurity.deleteGroup(groupName);

        return reply.code(204).send();
    });
}