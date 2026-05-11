import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const bodySchema = Type.Object({
    groupName: Type.String(),
    textName: Type.Optional(Type.String()),
    textDescription: Type.Optional(Type.String()),
    roles: Type.Optional(
        Type.Array(
            Type.Object({
                rolename: Type.String(),
                priority: Type.Integer()
            }))
    ),
})

export default async (fastify: FastifyInstance) => {
    fastify.post('/', {
        schema: {
            tags: ['mqtt_groups'],
            body: bodySchema,
            response: {
                201: Type.Null()
            }
        }
    }, async (request: FastifyRequest<{ Body: Static<typeof bodySchema> }>, reply: FastifyReply) => {
        const { groupName, roles } = request.body;
        await fastify.mqttDynamicSecurity.createGroup(groupName, roles);

        return reply.code(201).send();
    });
}