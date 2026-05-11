import { buildServer } from "./helper.js";
import { test } from 'tap';


test('Clients', async (t) => {
    const server = buildServer(t);

    await server.ready();

    await t.test('Get clients', async (t) => {
        const res = await server.inject({
            method: 'GET',
            url: '/clients'
        });

        t.same(res.statusCode, 200, 'Get clients 200');
        const json = await res.json();
        t.same(json, ['admin'], 'Get clients body')
    })

    await t.test('Get client', async (t) => {
        const res = await server.inject({
            method: 'GET',
            url: '/clients/admin'
        });

        t.same(res.statusCode, 200, 'Get client 200');
        const json = await res.json();

        t.type(json.connections, 'array');

        delete json.connections;
        t.same(json, {
            username: "admin",
            roles: [
                {
                    rolename: "admin",
                }
            ],
            groups: [],
        }, 'Get client body')
    })

    await t.test('Create client', async (t) => {
        let res = await server.inject({
            method: 'POST',
            url: '/clients',
            body: {
                username: "new-client",
                password: 'password',
                clientId: "client-id",
                textName: "text-description",
                textDescription: "text-description",
                roles: [{
                    rolename: 'admin',
                    priority: 10
                }]
            }
        });

        t.same(res.statusCode, 201, 'Create client 201');

        res = await server.inject({
            method: 'GET',
            url: '/clients/new-client'
        });

        t.same(res.statusCode, 200, 'Get new client 200');
        const json = await res.json();
        delete json.connections;
        t.same(json, {
            username: "new-client",
            roles: [
                {
                    rolename: "admin",
                }
            ],
            groups: [],
        }, 'Get new client body')
    })

    await t.test('Delete client', async (t) => {
        let res = await server.inject({
            method: 'DELETE',
            url: '/clients/new-client'
        });

        t.same(res.statusCode, 204, 'Delete client 200');

        res = await server.inject({
            method: 'GET',
            url: '/clients'
        });

        t.same(res.statusCode, 200, 'Get clients 200');
        const json = await res.json();
        t.same(json, ['admin'], 'Get clients body')

    })
})

