# fastify-mqtt-dynamic-security

A Fastify plugin for managing MQTT dynamic security through HTTP REST endpoints. This plugin provides a convenient API to manage MQTT clients, roles, groups, and access control lists (ACLs) using Mosquitto's dynamic security plugin.

## Installation

Install the package using npm or yarn:

```bash
npm install @albirex/fastify-mqtt-dynamic-security
```

Or with yarn:

```bash
yarn add @albirex/fastify-mqtt-dynamic-security
```

### Peer Dependencies

This package requires the following peer dependencies:

- **fastify**: `^5.8.5` - The web framework
- **mqtt**: `^5.15.1` - MQTT client library

Install them if not already present:

```bash
npm install fastify mqtt
```

## Usage

### Basic Setup

Register the plugin with Fastify and pass an MQTT client instance:

```typescript
import fastify from 'fastify';
import plugin from '@albirex/fastify-mqtt-dynamic-security';
import { connect } from 'mqtt';

const app = fastify({
    logger: true
});

// Connect to your MQTT broker
const mqttClient = connect('mqtt://localhost:1883', {
    username: 'admin',
    password: 'password',
    protocolVersion: 5,
});

// Register the plugin
app.register(plugin, {
    mqttClient: mqttClient
});

app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening on ${address}`);
});
```

### Plugin Options

The plugin accepts the following options:

```typescript
interface FastifyMqttDynamicSecurityOpts {
    mqttClient: MqttClient;        // Required: MQTT client instance
    responseTimeout?: number;      // Optional: Response timeout in ms (default: 2000)
    routePrefix?: string;          // Optional: Route prefix for all endpoints (default: none)
}
```

- **mqttClient**: The MQTT client instance used to communicate with the Mosquitto broker
- **responseTimeout**: How long (in milliseconds) to wait for MQTT responses before timing out
- **routePrefix**: Optional prefix to add to all routes (e.g., `/api/mqtt`)

## Routes

The plugin exposes REST endpoints organized into three main categories: **Clients**, **Roles**, and **Groups**.

### Clients

#### List MQTT Clients

**Endpoint**: `GET /clients`

List all MQTT clients configured in the dynamic security plugin.

**Query Parameters**:
- `count`: Number of results (default: -1 for all)
- `offset`: Pagination offset (default: 0)

**Response**: `200 OK`
```json
{
  "clients": [
    {
      "clientid": "client-1",
      "username": "user1",
      "groups": [...],
      "roles": [...]
    }
  ]
}
```

#### Get MQTT Client

**Endpoint**: `GET /clients/:username`

Retrieve details about a specific MQTT client.

**URL Parameters**:
- `username`: The username of the client

**Response**: `200 OK`
```json
{
  "client": {
    "clientid": "client-1",
    "username": "user1",
    "textname": "User One",
    "textdescription": "Description of user",
    "groups": [
      {
        "groupname": "group-1",
        "priority": 100
      }
    ],
    "roles": [
      {
        "rolename": "admin",
        "priority": 50
      }
    ]
  }
}
```

#### Create MQTT Client

**Endpoint**: `POST /clients`

Create a new MQTT client with optional groups and roles.

**Request Body**:
```json
{
  "username": "new_user",
  "password": "secure_password",
  "clientId": "optional-client-id",
  "textName": "Display Name",
  "textDescription": "Client description",
  "groups": [
    {
      "groupname": "group-1",
      "priority": 100
    }
  ],
  "roles": [
    {
      "rolename": "subscriber",
      "priority": 50
    }
  ]
}
```

**Response**: `201 Created`

#### Delete MQTT Client

**Endpoint**: `DELETE /clients/:username`

Delete an MQTT client.

**URL Parameters**:
- `username`: The username of the client to delete

**Response**: `204 No Content`

### Roles

#### List MQTT Roles

**Endpoint**: `GET /roles`

List all MQTT roles configured in the dynamic security plugin.

**Query Parameters**:
- `count`: Number of results (default: -1 for all)
- `offset`: Pagination offset (default: 0)

**Response**: `200 OK`
```json
{
  "roles": [
    {
      "rolename": "admin",
      "textname": "Administrator",
      "textdescription": "Admin role with full access",
      "acls": [...]
    }
  ]
}
```

#### Get MQTT Role

**Endpoint**: `GET /roles/:roleName`

Retrieve details about a specific MQTT role including its ACLs.

**URL Parameters**:
- `roleName`: The name of the role

**Response**: `200 OK`
```json
{
  "role": {
    "rolename": "subscriber",
    "textname": "Subscriber",
    "textdescription": "Role for message subscribers",
    "acls": [
      {
        "acltype": "subscribeLiteral",
        "topic": "sensors/temperature",
        "priority": 0,
        "allow": true
      }
    ]
  }
}
```

#### Create MQTT Role

**Endpoint**: `POST /roles`

Create a new MQTT role with optional ACL rules.

**Request Body**:
```json
{
  "roleName": "sensor_reader",
  "textName": "Sensor Reader",
  "textDescription": "Role for reading sensor data",
  "acls": [
    {
      "aclType": "subscribeLiteral",
      "topic": "sensors/+",
      "priority": 0,
      "allow": true
    },
    {
      "aclType": "publishClientReceive",
      "topic": "sensors/+",
      "priority": 0,
      "allow": false
    }
  ]
}
```

**ACL Types**:
- `publishClientSend`: Client publishing to a topic
- `publishClientReceive`: Client receiving published messages
- `subscribeLiteral`: Subscribe to a literal topic
- `subscribePattern`: Subscribe to a topic pattern
- `unsubscribeLiteral`: Unsubscribe from a literal topic
- `unsubscribePattern`: Unsubscribe from a topic pattern

**Response**: `201 Created`

#### Delete MQTT Role

**Endpoint**: `DELETE /roles/:roleName`

Delete an MQTT role.

**URL Parameters**:
- `roleName`: The name of the role to delete

**Response**: `204 No Content`

### Groups

#### List MQTT Groups

**Endpoint**: `GET /groups`

List all MQTT groups configured in the dynamic security plugin.

**Query Parameters**:
- `count`: Number of results (default: -1 for all)
- `offset`: Pagination offset (default: 0)

**Response**: `200 OK`
```json
{
  "groups": [
    {
      "groupname": "sensors-group",
      "roles": [...]
    }
  ]
}
```

#### Get MQTT Group

**Endpoint**: `GET /groups/:groupName`

Retrieve details about a specific MQTT group including its roles.

**URL Parameters**:
- `groupName`: The name of the group

**Response**: `200 OK`
```json
{
  "group": {
    "groupname": "devices",
    "textname": "Device Group",
    "textdescription": "Group for IoT devices",
    "roles": [
      {
        "rolename": "device_publisher",
        "priority": 100
      }
    ]
  }
}
```

#### Create MQTT Group

**Endpoint**: `POST /groups`

Create a new MQTT group with optional roles.

**Request Body**:
```json
{
  "groupName": "iot_devices",
  "textName": "IoT Devices",
  "textDescription": "Group for all IoT devices",
  "roles": [
    {
      "rolename": "publisher",
      "priority": 100
    },
    {
      "rolename": "subscriber",
      "priority": 50
    }
  ]
}
```

**Response**: `201 Created`

#### Delete MQTT Group

**Endpoint**: `DELETE /groups/:groupName`

Delete an MQTT group.

**URL Parameters**:
- `groupName`: The name of the group to delete

**Response**: `204 No Content`

## Example

Here's a complete example using the plugin:

```typescript
import fastify from 'fastify';
import plugin from '@albirex/fastify-mqtt-dynamic-security';
import { connect } from 'mqtt';

const app = fastify({
    logger: true
});

// Connect to MQTT broker
const mqttClient = connect(process.env.MQTT_HOST ?? 'mqtt://localhost:1883', {
    username: process.env.MQTT_USERNAME ?? 'admin',
    password: process.env.MQTT_PASSWORD ?? 'password',
    protocolVersion: 5,
});

mqttClient.on('error', (err) => {
    throw err;
});

// Register the plugin
app.register(plugin, {
    mqttClient: mqttClient
});

app.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening on ${address}`);
});
```

### Using the API

```bash
# Create a role
curl -X POST http://localhost:3000/roles \
  -H "Content-Type: application/json" \
  -d '{
    "roleName": "subscriber",
    "textName": "Message Subscriber",
    "acls": [
      {
        "aclType": "subscribeLiteral",
        "topic": "sensors/+",
        "priority": 0,
        "allow": true
      }
    ]
  }'

# Create a group
curl -X POST http://localhost:3000/groups \
  -H "Content-Type: application/json" \
  -d '{
    "groupName": "devices",
    "roles": [
      {
        "rolename": "subscriber",
        "priority": 100
      }
    ]
  }'

# Create a client
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -d '{
    "username": "device-001",
    "password": "secure_password",
    "clientId": "device-001",
    "groups": [
      {
        "groupname": "devices",
        "priority": 100
      }
    ]
  }'

# List all clients
curl http://localhost:3000/clients

# Get specific client details
curl http://localhost:3000/clients/device-001

# Delete a client
curl -X DELETE http://localhost:3000/clients/device-001
```

## Docker Setup

A Docker Compose configuration is included for development and testing. It sets up:
- Mosquitto MQTT broker with dynamic security plugin enabled
- Pre-configured password authentication

To run the Docker setup:

```bash
docker-compose build
docker-compose up
```

The MQTT broker will be available on:
- **MQTT**: `localhost:1883`
- **WebSocket**: `localhost:9001`

## Types

The plugin exports TypeScript types for working with MQTT entities. Key types include:

- `Acl`: Access Control List rule definition
- `ClientGroup`: Group assignment for a client
- `ClientRole`: Role assignment for a client
- `GetClientResponse`: Response when retrieving a client
- `GetGroupResponse`: Response when retrieving a group
- `GetRoleResponse`: Response when retrieving a role
- `ListClientsResponse`: Response when listing clients
- `ListGroupsResponse`: Response when listing groups
- `ListRolesResponse`: Response when listing roles

## Requirements

- Node.js 18+
- Mosquitto MQTT broker with dynamic security plugin support
- Fastify 5.8.5+
- MQTT client library 5.15.1+

## License

ISC
