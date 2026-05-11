import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const paramsSchema = Type.Object({
    groupName: Type.String()
})

const responseSchema = Type.Object({
    groupname: Type.String(),
    clients: Type.Optional(Type.Array(Type.String())),
    roles: Type.Optional(Type.Array(Type.Object({
        rolename: Type.String(),
        priority: Type.Number()
    })))
});

export default async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: {
            tags: ['mqtt_groups'],
            params: paramsSchema,
            response: {
                200: responseSchema
            }
        }
    }, async (request: FastifyRequest<{ Params: Static<typeof paramsSchema> }>, reply: FastifyReply) => {
        const { groupName } = request.params;
        const group = await fastify.mqttDynamicSecurity.getGroup(groupName);

        return reply.code(200).send(group.group);
    });
}