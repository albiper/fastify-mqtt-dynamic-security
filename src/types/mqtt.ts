import { Type } from "@sinclair/typebox";

export type Acl = {
    aclType: 'publishClientSend' | 'publishClientReceive' | 'subscribeLiteral' | 'subscribePattern' | 'unsubscribeLiteral' | 'unsubscribePattern';
    topic: string;
    priority: number;
    allow: boolean;
}

export type ClientGroup = {
    groupname: string;
    priority: number;
}

export type ClientRole = {
    rolename: string;
    priority: number;
}

export type ListRolesResponse = {
    totalCount: number;
    roles: string[];
}

export type ListClientsResponse = {
    totalCount: number;
    clients: string[];
}

export type ListGroupsResponse = {
    totalCount: number;
    groups: string[];
}

export type GetRoleResponse = {
    role: {
        rolename: string;
        textname?: string;
        textdescription?: string;
        allowwildcardsubs: boolean;
        acls: Acl[];
    }
}

export type GetGroupResponse = {
    group: {
        groupname: string;
        textname?: string;
        textdescription?: string;
        acls: Acl[];
    }
}

export type GetClientResponse = {
    client: {
        username: string;
        textname?: string;
        textdescription?: string;
        clientid?: string;
        groups: ClientGroup[];
        roles: ClientRole[];
    }
}

export const listQuerySchema = Type.Optional(Type.Object({
    totalCount: Type.Optional(Type.Boolean()),
    limit: Type.Optional(Type.Integer()),
    offset: Type.Optional(Type.Integer())
}))