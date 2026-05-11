import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const paramsSchema = Type.Object({
    username: Type.String()
})

const responseSchema = Type.Object({
    username: Type.String(),
    roles: Type.Optional(Type.Array(Type.Object({ rolename: Type.String() }))),
    groups: Type.Optional(Type.Array(Type.Object({ groupname: Type.String() }))),
    connections: Type.Optional(Type.Array(Type.Object({ address: Type.String() }))),
})

export default async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: {
            tags: ['clients'],
            params: paramsSchema,
            response: {
                200: responseSchema
            }
        }
    }, async (request: FastifyRequest<{ Params: Static<typeof paramsSchema> }>, reply: FastifyReply) => {
        const { username } = request.params;
        const client = await fastify.mqttDynamicSecurity.getClient(username);

        return reply.code(200).send(client.client);
    });
}