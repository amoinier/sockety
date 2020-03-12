# Sockety (WIP)

If you want to do HTTP request in your personal network from outside without open port, you can use Sockety ! It provide a websocket connection between 2 apps (written in Typescript).
One app in your personnal network (client), one app where you want (server).

## Features
* Multiple client split by token.
* Return HTTP response from client if it respond under 1 sec.
* Ping client every 30 sec.

## Server
It create a websocket server to send HTTP request at the client.

### Build/Install

#### Raw
Go in **server/** folder
```
cd server/
```

Install npm package

```
npm install
```

Run in development mode
```
npm run dev
```

#### Docker
Go in **server/** folder
```
cd server/
```

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

#### Raw
Go in **client/** folder
```
cd client/
```

Install npm package

```
npm install
```

Run in development mode
```
npm run dev
``` 

#### Docker
Go in **client/** folder
```
cd client/
```

Build docker image
```
docker build -t sockety_client .
```

Start docker image (need 3 env variables: SERVER_IP, SERVER_PORT, WEBSOCKET_TOKEN)
> SERVER_IP: Serveur IP/address.

> SERVER_PORT: Websocket port define in server startup.

> WEBSOCKET_TOKEN (optional): Define a token to "secure" your request. It's optional, without WEBSOCKET_TOKEN, client create one and display it in logs.
```
docker run -e SERVER_IP=localhost -e SERVER_PORT=8000 -e WEBSOCKET_TOKEN=qwertyuiop sockety_client
```

## Usage
When your server and client is ready and client is connected to server, you just need to POST request on server:
`<SERVER_IP>:<SERVER_PORT>/sockety?token=<WEBSOCKET_TOKEN>`.

You can set the token in headers instead of query, in **Authorization** like: `Bearer <WEBSOCKET_TOKEN>`.

(if you set your token in headers and query, Sockety check both if it matches with a client).
The body define request informations:
> url (string): Every url you want.

> method (string): 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH'.

> headers (JSON): All HTTP headers.

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
