<p align="center">
    <h1 align="center">SOCKETY</h1>
</p>
<p align="center">
    <em>Bridging Networks Remotely, One Socket at a Time</em>
</p>
<p align="center">
	<img src="https://img.shields.io/github/license/amoinier/sockety?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/amoinier/sockety?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/amoinier/sockety?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/amoinier/sockety?style=default&color=0080ff" alt="repo-language-count">
</p>
<p align="center">
	<!-- default option, no dependency badges. -->
</p>

<br>

## Overview

Sockety is an advanced open-source project that sets up a robust client-server model using websockets for real-time communication, primarily facilitating remote access to personal networks. Implemented in TypeScript and containerized using Docker, the software ensures streamlined deployment and extensive interoperability. The server side handles socket creation, event management, and client communication, while the client-side takes care of user interaction and data transmission. With added features such as error feedback, connection health monitoring, and automatic reconnection, Sockety significantly enhances the efficiency and reliability of client-server communication in real-time applications.

## Features

Because of usage of websocket, response body is limited to 1400 characters.

- Multiple client split by client ID.
- Return HTTP response from client if it respond under 1 sec.
- Ping client every 30 sec.

## Usage

When your server and client is ready and client is connected to server, you just need to do a POST request on server:
`<SERVER_IP>:<SERVER_PORT>/sockety?client_id=<WEBSOCKET_CLIENTID>`.

The body define request informations for the request sending by client:

> client_id (string): If you want to set client_id in body, you can with this parameters.

> url (string): Every url you want.

> method (string): 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH'.

> headers (JSON): All HTTP headers you want.

> body (JSON): Everything you want.

```
{
	"url": "https://example.com",
	"method": "GET",
	"headers": {
		"authorization": "Bearer XXXX",
		...
	},
	"body": {
		"login": "amoinier",
		...
	}
}
```

## Server

It create a websocket server to send HTTP request at the client.

### Build/Install

Go in **server/** folder

```
cd server/
```

#### Development

Install npm packages

```
npm install
```

Run in development mode

```
npm run dev
```

#### Production

Install npm packages (production only)

```
npm install
```

Build app

```
npm run build
```

Run in production mode

```
npm start
```

#### Docker

Build docker image

```
docker build -t sockety_server .
```

Start docker image (need 2 env variables: HTTP_PORT, WEBSOCKET_PORT)

> HTTP_PORT: HTTP Serveur port.

> WEBSOCKET_PORT: Weboscket Serveur port.

```
docker run -p3000:3000 -p8000:8000 -e HTTP_PORT=3000 -e WEBSOCKET_PORT=8000 sockety_server
```

## Client

It connect to the server in websocket and send request with server datas received.

### Build/Install

Go in **client/** folder

```
cd client/
```

#### Development

Install npm packages

```
npm install
```

Run in development mode

```
npm run dev
```

#### Production

Install npm packages (production only)

```
npm install
```

Build app

```
npm run build
```

Run in production mode

```
npm start
```

#### Docker

Build docker image

```
docker build -t sockety_client .
```

Start docker image (need 3 env variables: SERVER_IP, SERVER_PORT, WEBSOCKET_CLIENTID)

> SERVER_IP: Serveur IP/address.

> SERVER_PORT: Websocket port define in server startup.

> WEBSOCKET_CLIENTID (optional): Define a client ID to "secure" your request. It's optional, without WEBSOCKET_CLIENTID, client create one and display it in logs.

```
docker run -e SERVER_IP=localhost -e SERVER_PORT=8000 -e WEBSOCKET_CLIENTID=qwertyuiop sockety_client
```
