import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const bodySchema = Type.Object({
    roleName: Type.String(),
    textName: Type.Optional(Type.String()),
    textDescription: Type.Optional(Type.String()),
    acls: Type.Optional(
        Type.Array(
            Type.Object({
                aclType: Type.Union([
                    Type.Literal('publishClientSend'),
                    Type.Literal('publishClientReceive'),
                    Type.Literal('subscribeLiteral'),
                    Type.Literal('subscribePattern'),
                    Type.Literal('unsubscribeLiteral'),
                    Type.Literal('unsubscribePattern'),
                ]),
                topic: Type.String(),
                priority: Type.Integer(),
                allow: Type.Boolean()
            }))
    ),
})
export default async (fastify: FastifyInstance) => {
    fastify.post('/', {
        schema: {
            tags: ['mqtt_roles'],
            body: bodySchema,
            response: {
                201: Type.Null()
            }
        }
    }, async (request: FastifyRequest<{ Body: Static<typeof bodySchema> }>, reply: FastifyReply) => {
        const { roleName, textName, textDescription, acls } = request.body;
        await fastify.mqttDynamicSecurity.createRole(roleName, textName, textDescription, acls);

        return reply.code(201).send();
    });
}