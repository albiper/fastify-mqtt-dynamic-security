import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const paramsSchema = Type.Object({
    username: Type.String()
})

export default async (fastify: FastifyInstance) => {
    fastify.delete('/', {
        schema: {
            tags: ['mqtt_clients'],
            params: paramsSchema,
            response: {
                204: Type.Null()
            }
        }
    }, async (request: FastifyRequest<{ Params: Static<typeof paramsSchema> }>, reply: FastifyReply) => {
        const { username } = request.params;
        await fastify.mqttDynamicSecurity.deleteClient(username);

        return reply.code(204).send();
    });
}