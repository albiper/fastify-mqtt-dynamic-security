import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const paramsSchema = Type.Object({
    roleName: Type.String()
})

export default async (fastify: FastifyInstance) => {
    fastify.delete('/', {
        schema: {
            tags: ['mqtt_roles'],
            params: paramsSchema,
            response: {
                204: Type.Null()
            }
        }
    }, async (request: FastifyRequest<{ Params: Static<typeof paramsSchema> }>, reply: FastifyReply) => {
        const { roleName } = request.params;
        await fastify.mqttDynamicSecurity.deleteRole(roleName);

        return reply.code(204).send();
    });
}