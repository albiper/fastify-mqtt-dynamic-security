import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const bodySchema = Type.Object({
    username: Type.String(),
    password: Type.String(),
    clientId: Type.Optional(Type.String()),
    textName: Type.Optional(Type.String()),
    textDescription: Type.Optional(Type.String()),
    groups: Type.Optional(
        Type.Array(
            Type.Object({
                groupname: Type.String(),
                priority: Type.Integer()
            }))
    ),
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
            tags: ['mqtt_clients'],
            body: bodySchema,
            response: {
                201: Type.Null()
            }
        }
    }, async (request: FastifyRequest<{ Body: Static<typeof bodySchema> }>, reply: FastifyReply) => {
        const { username, password, clientId, textName, textDescription, groups, roles } = request.body;
        await fastify.mqttDynamicSecurity.createClient(username, password, clientId, textName, textDescription, groups, roles);

        return reply.code(201).send();
    });
}