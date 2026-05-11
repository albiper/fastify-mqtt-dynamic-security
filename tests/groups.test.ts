import { buildServer } from "./helper.js";
import { test } from 'tap';


test('Groups', async (t) => {
    const server = buildServer(t);

    await server.ready();

    await t.test('Get groups', async (t) => {
        const res = await server.inject({
            method: 'GET',
            url: '/groups'
        });

        t.same(res.statusCode, 200, 'Get groups 200');
        const json = await res.json();
        t.same(json, [], 'Get groups body')
    })

    await t.test('Create group', async (t) => {
        let res = await server.inject({
            method: 'POST',
            url: '/groups',
            body: {
                groupName: "new-group",
                roles: [
                    {
                        rolename: 'admin',
                        priority: 10,
                    }
                ]
            }
        });

        t.same(res.statusCode, 201, 'Create group 201');

        res = await server.inject({
            method: 'GET',
            url: '/groups/new-group'
        });

        t.same(res.statusCode, 200, 'Get new group 200');
        const json = await res.json();
        t.same(json, {
            groupname: "new-group",
            roles: [
                {
                    rolename: "admin",
                    priority: 10,
                }
            ],
            clients: []
        }, 'Get new group body')
    })

    await t.test('Get group', async (t) => {
        const res = await server.inject({
            method: 'GET',
            url: '/groups/new-group'
        });

        t.same(res.statusCode, 200, 'Get group 200');
        const json = await res.json();
        t.same(json, {
            groupname: "new-group",
            roles: [
                {
                    rolename: "admin",
                    priority: 10,
                }
            ],
            clients: []
        }, 'Get group body')
    })

    await t.test('Delete group', async (t) => {
        let res = await server.inject({
            method: 'DELETE',
            url: '/groups/new-group'
        });

        t.same(res.statusCode, 204, 'Delete group 200');

        res = await server.inject({
            method: 'GET',
            url: '/groups'
        });

        t.same(res.statusCode, 200, 'Get groups 200');
        const json = await res.json();
        t.same(json, [], 'Get groups body')

    })
})

