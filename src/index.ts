import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { MqttClient } from "mqtt";
import { Acl, ClientGroup, ClientRole, GetClientResponse, GetGroupResponse, GetRoleResponse, ListClientsResponse, ListGroupsResponse, ListRolesResponse } from "./types/mqtt.js";
import fastifyAutoload from "@fastify/autoload";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface FastifyMqttDynamicSecurityOpts {
    mqttClient?: MqttClient,
    responseTimeout?: number,
    routePrefix?: string
}

export const controlTopic = '$CONTROL/dynamic-security/v1';

export default fastifyPlugin(async (fastify: FastifyInstance, opts: FastifyMqttDynamicSecurityOpts) => {
    const sendCommandMqttMessageAndAwaitResponse = async<T>(body: unknown, command: string) => {
        const timeoutMs = opts.responseTimeout ?? 2000;
        opts.mqttClient?.publish(controlTopic, JSON.stringify(body));

        return new Promise<T>((resolve, reject) => {
            const timer = setTimeout(() => {
                opts.mqttClient?.off('message', handler);
                reject(new Error(`Timeout waiting for MQTT response to command: ${command}`));
            }, timeoutMs);

            function handler(topic: string, message: Buffer) {
                if (topic !== `${controlTopic}/response`) return;

                const payload = JSON.parse(message.toString());
                const response = payload.responses?.[0];

                if (!response || response.command !== command) return;

                clearTimeout(timer);
                opts.mqttClient?.off('message', handler);

                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.data ?? undefined);
                }
            }

            opts.mqttClient?.on('message', handler);
        });
    }

    const dynamicSecurityManager = {
        listRoles: async (count: number = -1, offset: number = 0): Promise<ListRolesResponse> => {
            return await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'listRoles',
                        count,
                        offset
                    }
                ]
            }, 'listRoles');
        },
        getRole: async (roleName: string): Promise<GetRoleResponse> => {
            return await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'getRole',
                        rolename: roleName
                    }
                ]
            }, 'getRole');
        },
        createRole: async (roleName: string,
            textName?: string,
            textDescription?: string,
            acls?: Acl[]) => {
            await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'createRole',
                        rolename: roleName,
                        textname: textName,
                        textdescription: textDescription,
                        acls
                    }
                ]
            }, 'createRole');
        },
        deleteRole: async (roleName: string) => {
            await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'deleteRole',
                        rolename: roleName,
                    }
                ]
            }, 'deleteRole');
        },
        listClients: async (count: number = -1, offset: number = 0): Promise<ListClientsResponse> => {
            return await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'listClients',
                        count,
                        offset
                    }]
            }, 'listClients');
        },
        getClient: async (username: string): Promise<GetClientResponse> => {
            return await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'getClient',
                        username

                    }
                ]
            }, 'getClient');
        },
        createClient: async (
            username: string,
            password: string,
            clientId?: string,
            textName?: string,
            textDescription?: string,
            groups?: ClientGroup[],
            roles?: ClientRole[]
        ) => {
            await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'createClient',
                        username,
                        password,
                        clientid: clientId,
                        textname: textName,
                        textdescription: textDescription,
                        groups,
                        roles
                    }
                ]
            }, 'createClient');
        },
        updateClient: async (
            username: string,
            data: {
                password?: string;
                clientId?: string;
                textName?: string;
                textDescription?: string;
                groups?: ClientGroup[];
                roles?: ClientRole[];
            }
        ) => {
            await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'modifyClient',
                        username,
                        password: data.password,
                        clientid: data.clientId,
                        textname: data.textName,
                        textdescription: data.textDescription,
                        groups: data.groups,
                        roles: data.roles
                    }
                ]
            }, 'modifyClient');
        },
        deleteClient: async (username: string) => {
            await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'deleteClient',
                        username,
                    }
                ]
            }, 'deleteClient');
        },
        enableClient: async (username: string) => {
            await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'enableClient',
                        username,
                    }
                ]
            }, 'enableClient');
        },
        disableClient: async (username: string) => {
            await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'disableClient',
                        username,
                    }
                ]
            }, 'disableClient');
        },
        listGroups: async (count: number = -1, offset: number = 0): Promise<ListGroupsResponse> => {
            return await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'listGroups',
                        count,
                        offset
                    }
                ]
            }, 'listGroups');
        },
        getGroup: async (groupName: string): Promise<GetGroupResponse> => {
            return await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'getGroup',
                        groupname: groupName
                    }
                ]
            }, 'getGroup');
        },
        createGroup: async (groupName: string, roles?: ClientRole[]) => {
            await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'createGroup',
                        groupname: groupName,
                        roles: roles
                    }
                ]
            }, 'createGroup');
        },
        deleteGroup: async (groupName: string) => {
            await sendCommandMqttMessageAndAwaitResponse({
                commands: [
                    {
                        command: 'deleteGroup',
                        groupname: groupName,
                    }
                ]
            }, 'deleteGroup');
        },
    };

    fastify.decorate('mqttDynamicSecurity', dynamicSecurityManager);

    fastify.register(fastifyAutoload, {
        dir: join(__dirname, 'routes'),
        prefix: opts.routePrefix ?? '/mqtt',
        routeParams: true
    })

    fastify.addHook('onReady', (done) => {
        opts.mqttClient?.subscribe('$CONTROL/dynamic-security/v1/#', { nl: true, qos: 0 }, (err) => {
            if (err) {
                throw err;
            } else {
                fastify.log.info('Listening on topic [$CONTROL/dynamic-security/v1/#]');
            }
        });

        done();
    });
})

declare module 'fastify' {
    interface FastifyInstance {
        mqttDynamicSecurity: {
            listRoles: (count?: number, offset?: number) => Promise<ListRolesResponse>;
            getRole: (roleName: string) => Promise<GetRoleResponse>;
            createRole: (roleName: string, textName?: string, textDescription?: string, acls?: Acl[]) => Promise<void>;
            deleteRole: (roleName: string) => Promise<void>;
            listClients: (count?: number, offset?: number) => Promise<ListClientsResponse>;
            getClient: (username: string) => Promise<GetClientResponse>;
            createClient: (username: string,
                password: string,
                clientId?: string,
                textName?: string,
                textDescription?: string,
                groups?: ClientGroup[],
                roles?: ClientRole[]) => Promise<void>;
            updateClient: (username: string, data: {
                password: string,
                clientId?: string,
                textName?: string,
                textDescription?: string,
                groups?: ClientGroup[],
                roles?: ClientRole[]
            }) => Promise<void>;
            deleteClient: (username: string) => Promise<void>;
            enableClient: (username: string) => Promise<void>;
            disableClient: (username: string) => Promise<void>;
            listGroups: (count?: number, offset?: number) => Promise<ListGroupsResponse>;
            getGroup: (groupName: string) => Promise<GetGroupResponse>;
            createGroup: (groupName: string, roles?: ClientRole[]) => Promise<void>;
            deleteGroup: (groupName: string) => Promise<void>;
        }
    }
}