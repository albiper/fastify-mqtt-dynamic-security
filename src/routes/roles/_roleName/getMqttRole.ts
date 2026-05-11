import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const paramsSchema = Type.Object({
    roleName: Type.String()
})

const responseSchema = Type.Object({
    rolename: Type.String(),
    textname: Type.Optional(Type.String()),
    textdescription: Type.Optional(Type.String()),
    allowwildcardsubs: Type.Optional(Type.Boolean()),
    acls: Type.Optional(Type.Array(Type.Object({
        acltype: Type.String(),
        topic: Type.String(),
        priority: Type.Integer(),
        allow: Type.Boolean(),
    })))
})

export default async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: {
            tags: ['mqtt_roles'],
            params: paramsSchema,
            response: {
                200: responseSchema
            }
        }
    }, async (request: FastifyRequest<{ Params: Static<typeof paramsSchema> }>, reply: FastifyReply) => {
        const { roleName } = request.params;
        const role = await fastify.mqttDynamicSecurity.getRole(roleName);

        return reply.code(200).send(role.role);
    });
}