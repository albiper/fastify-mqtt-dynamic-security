import { buildServer } from "../helper.js";
import { test } from 'tap';


test('Roles', async (t) => {
    const server = buildServer(t);

    await server.ready();

    await t.test('Get roles', async (t) => {
        const res = await server.inject({
            method: 'GET',
            url: '/roles'
        });

        t.same(res.statusCode, 200, 'Get roles 200');
        const json = await res.json();
        t.same(json, ['admin'], 'Get roles body')
    })

    await t.test('Get role', async (t) => {
        const res = await server.inject({
            method: 'GET',
            url: '/roles/admin'
        });

        t.same(res.statusCode, 200, 'Get role 200');
        const json = await res.json();
        t.same(json, {
            rolename: "admin",
            allowwildcardsubs: true,
            acls: [
                {
                    acltype: "publishClientSend",
                    topic: "$CONTROL/dynamic-security/#",
                    priority: 0,
                    allow: true,
                },
                {
                    acltype: "publishClientReceive",
                    topic: "$CONTROL/dynamic-security/#",
                    priority: 0,
                    allow: true,
                },
                {
                    acltype: "publishClientReceive",
                    topic: "$SYS/#",
                    priority: 0,
                    allow: true,
                },
                {
                    acltype: "publishClientReceive",
                    topic: "#",
                    priority: 0,
                    allow: true,
                },
                {
                    acltype: "subscribePattern",
                    topic: "$CONTROL/dynamic-security/#",
                    priority: 0,
                    allow: true,
                },
                {
                    acltype: "subscribePattern",
                    topic: "$SYS/#",
                    priority: 0,
                    allow: true,
                },
                {
                    acltype: "subscribePattern",
                    topic: "#",
                    priority: 0,
                    allow: true,
                },
                {
                    acltype: "unsubscribePattern",
                    topic: "#",
                    priority: 0,
                    allow: true,
                }
            ]
        }, 'Get role body')
    })

    await t.test('Create role', async (t) => {
        let res = await server.inject({
            method: 'POST',
            url: '/roles',
            body: {
                roleName: "new-role",
                textName: "text-name",
                textDescription: "text-description",
                acls: [
                    {
                        aclType: 'publishClientSend',
                        topic: 'test',
                        priority: 10,
                        allow: true
                    }
                ]
            }
        });

        t.same(res.statusCode, 201, 'Create role 201');

        res = await server.inject({
            method: 'GET',
            url: '/roles/new-role'
        });

        t.same(res.statusCode, 200, 'Get new role 200');
        const json = await res.json();
        t.same(json, {
            rolename: "new-role",
            textname: "text-name",
            textdescription: "text-description",
            allowwildcardsubs: true,
            acls: [
                {
                    acltype: "publishClientSend",
                    topic: "test",
                    priority: 10,
                    allow: true,
                }
            ]
        }, 'Get new role body')
    })

    await t.test('Delete role', async (t) => {
        let res = await server.inject({
            method: 'DELETE',
            url: '/roles/new-role'
        });

        t.same(res.statusCode, 204, 'Delete role 200');

        res = await server.inject({
            method: 'GET',
            url: '/roles'
        });

        t.same(res.statusCode, 200, 'Get roles 200');
        const json = await res.json();
        t.same(json, ['admin'], 'Get roles body')

    })
})

