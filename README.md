<p align="center">
  <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" width="20%" alt="SOCKETY-logo">
</p>
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

#####  Table of Contents

- [ Overview](#-overview)
- [ Features](#-features)
- [ Repository Structure](#-repository-structure)
- [ Modules](#-modules)
- [ Getting Started](#-getting-started)
    - [ Prerequisites](#-prerequisites)
    - [ Installation](#-installation)
    - [ Usage](#-usage)
    - [ Tests](#-tests)
- [ Project Roadmap](#-project-roadmap)
- [ Contributing](#-contributing)
- [ License](#-license)
- [ Acknowledgments](#-acknowledgments)

---

##  Overview

Sockety is an advanced open-source project that sets up a robust client-server model using websockets for real-time communication, primarily facilitating remote access to personal networks. Implemented in TypeScript and containerized using Docker, the software ensures streamlined deployment and extensive interoperability. The server side handles socket creation, event management, and client communication, while the client-side takes care of user interaction and data transmission. With added features such as error feedback, connection health monitoring, and automatic reconnection, Sockety significantly enhances the efficiency and reliability of client-server communication in real-time applications.

---

##  Features

|    |   Feature         | Description |
|----|-------------------|---------------------------------------------------------------|
| ⚙️  | **Architecture**  | This project is a Node.js app, using Socket.io for real-time, bidirectional, event-based communication and Express.js for routing and middleware. |
| 🔩 | **Code Quality**  | Clean, well written, and consistent code. Proper use of JavaScript best practices, modularity, and clear function definitions suggests high quality. |
| 📄 | **Documentation** | There is no dedicated documentation available in the repo which indicates a possible area of improvement. |
| 🔌 | **Integrations**  | Integrations include Express.js for web server, and Socket.IO for real-time, bi-directional communication. |
| 🧩 | **Modularity**    | The codebase is modular, well-structured into files and directories, each serving a single responsibility which boosts reuse and maintainability. |
| 🧪 | **Testing**       | No clear test files or test framework setup indicating a need for a testing suite for reliability and maintenance. |
| ⚡️  | **Performance**   | Use of Socket.IO enables efficient real-time data updates; however, detailed performance metrics are not provided in the repo. |
| 🛡️ | **Security**      | Although it uses Express.js, the project doesn't appear to utilise any specific security measures. This should be addressed. |
| 📦 | **Dependencies**  | Key dependencies include 'socket.io', 'express', 'fast-json-stable-stringify', 'react-is', 'jest', 'axios', 'celebrate', 'typescript'. |
| 🚀 | **Scalability**   | By leveraging Node.js and Socket.IO, the project inherently offers good scalability for real-time communication use-cases. |

---

##  Repository Structure

```sh
└── sockety/
    ├── LICENSE
    ├── README.md
    ├── client
    │   ├── .dockerignore
    │   ├── Dockerfile
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── src
    │   ├── tsconfig.json
    │   └── yarn.lock
    ├── package.json
    └── server
        ├── .dockerignore
        ├── Dockerfile
        ├── jest.config.js
        ├── package-lock.json
        ├── package.json
        ├── public
        ├── src
        ├── tests
        ├── tsconfig.json
        └── yarn.lock
```

---

##  Modules

<details closed><summary>.</summary>

| File | Summary |
| --- | --- |
| [package.json](https://github.com/amoinier/sockety/blob/main/package.json) | Sockety enables a websocket client/server for accessing personal networks remotely. The package.json file manages metadata related to the application version, repository, author, and bugs tracking, providing a roadmap to the project's information and update management. |

</details>

<details closed><summary>server</summary>

| File | Summary |
| --- | --- |
| [Dockerfile](https://github.com/amoinier/sockety/blob/main/server/Dockerfile) | Constructs a Docker image for the server component of the Sockety project. It begins by installing dependencies and building the TypeScript application, then creates a lighter-weight production image that includes the built application and its required production dependencies. |
| [tsconfig.json](https://github.com/amoinier/sockety/blob/main/server/tsconfig.json) | Configures TypeScript compiler options for the server side of the Sockety project. Sets the target ECMAScript version to ES2018, enabling strict type-checking and defining module resolution strategy based on Node.js. Also, directs the compiler to generate corresponding.map and.d.ts files. |
| [package-lock.json](https://github.com/amoinier/sockety/blob/main/server/package-lock.json) | The client' and server sections. The client directory contains the frontend of the application. It contains the necessary configuration and source files that are needed to manage the client-side operations like creating sockets, handling events, and managing real-time communication. The server directory, on the other hand, is responsible for the backend operations of the application. It includes the server-side implementation of the sockets, creation of events, and the communication with the client-side application. Jest is utilized for testing purposes as indicated by the presence of jest.config.js' file in the server directory. Dockerfiles located in both directories suggest that the application can be containerized for consistent deployment, irrespective of the environment. Lastly, the presence of licensing and readme files shows dedication to open-source guidelines. |
| [package.json](https://github.com/amoinier/sockety/blob/main/server/package.json) | Socketys server-side package.json manages its essential metadata and dependencies, facilitating various operations such as build, start, and testing. It also contains key identifiers like project name, version, and repository links, enabling comprehensive package management and seamless external interactions." |
| [jest.config.js](https://github.com/amoinier/sockety/blob/main/server/jest.config.js) | Facilitates server-side testing by configuring Jest, a JavaScript testing framework, with TypeScript support and a node test environment, ensuring the robustness of the sockety server application. |

</details>

<details closed><summary>server.src</summary>

| File | Summary |
| --- | --- |
| [index.ts](https://github.com/amoinier/sockety/blob/main/server/src/index.ts) | Serving as the entry point for the server-side of sockety, index.ts initializes the Express application and applies necessary loaders. It then listens on the specified HTTP port, thereby facilitating the server's operation. |

</details>

<details closed><summary>server.src.api</summary>

| File | Summary |
| --- | --- |
| [sockety.ts](https://github.com/amoinier/sockety/blob/main/server/src/api/sockety.ts) | Sockety.ts facilitates communication between the client and server via websockets. It validates incoming requests with JOI, uses the singleton pattern to manage client connections, and handles the encoding of messages for transmission. In case of issues, it provides error feedback in the response. |

</details>

<details closed><summary>server.src.classes</summary>

| File | Summary |
| --- | --- |
| [WSClient.ts](https://github.com/amoinier/sockety/blob/main/server/src/classes/WSClient.ts) | WSClient acts as the core interface in the Sockety repository, managing client interactions with the WebSocket server. It handles message events, initiates clients, monitors connection health, sends messages, and retrieves responses. Additionally, it decodes incoming messages and manages message storage. |
| [WSConnexion.ts](https://github.com/amoinier/sockety/blob/main/server/src/classes/WSConnexion.ts) | WSConnexion establishes a WebSocket server and manages its client connections. It stores connected clients, enables their addition and removal, and allows retrieval using client IDs. It also handles the creation of new connections, each represented as a WSClient instance with attached message event handler. |

</details>

<details closed><summary>server.src.loaders</summary>

| File | Summary |
| --- | --- |
| [express.ts](https://github.com/amoinier/sockety/blob/main/server/src/loaders/express.ts) | Express.ts sets up the server-side application, establishing the Express frameworks core services. It configures middleware functions like request body parsing, CORS, favicon serving, and error-handling. Additionally, it integrates the sockety' API endpoint and handles 404 errors. |
| [index.ts](https://github.com/amoinier/sockety/blob/main/server/src/loaders/index.ts) | Integrates key server-side functionalities, namely the WebSocket and ExpressJS services. It configures the initialization of these services, strengthening seamless connections between the client and server within the sockety repository. Ensures async loading of WebSocket and ExpressJS servers to optimize application performance. |
| [websocket.ts](https://github.com/amoinier/sockety/blob/main/server/src/loaders/websocket.ts) | Establishing a WebSocket connection, the websocket.ts script within the server-side loaders directory initiates the creation of an instance of the WSConnexion class from the classes directory. This orchestration plays an integral role in real-time, bidirectional communication for the Sockety application. |

</details>

<details closed><summary>client</summary>

| File | Summary |
| --- | --- |
| [Dockerfile](https://github.com/amoinier/sockety/blob/main/client/Dockerfile) | Defines a multi-stage Dockerfile that architects the setup for the client-side of the sockety application. It establishes an environment for building the source code and further streamlines the deployment with the relevant dependencies for a production environment. It wraps up by initiating the applications start command. |
| [tsconfig.json](https://github.com/amoinier/sockety/blob/main/client/tsconfig.json) | Defines TypeScript compiler options for the client-side of the sockety application, specifying the ECMAScript target to es2018 and module resolution to node. It includes rules for generating map files, enforcing strict type-checking, and resolving module names, thereby enhancing code reliability and interoperability. |
| [package-lock.json](https://github.com/amoinier/sockety/blob/main/client/package-lock.json) | Client' and server. The client directory contains the front-end part of the application, written in TypeScript and packaged using Docker. It includes the source code, dependencies detailed in package.json, and the TS configuration in tsconfig.json. The server directory, on the other hand, refers to the back-end portion of the Sockety application. It's also Dockerized and contains the Jest configuration for running server-side test cases. In synopsis, Sockety is a real-time, end-to-end, client-server application where the client is a user-friendly interface sending requests, and the server is an efficient back-end processor handling these requests. Through this architecture, the Sockety project demonstrates efficient client-server communication in real-time applications. |
| [package.json](https://github.com/amoinier/sockety/blob/main/client/package.json) | Socketys client/package.json" serves as a configuration blueprint for the Sockety project, defining dependencies, scripts, metadata, and entry points. Critically, it facilitates websocket communication, enabling outdoor access to personal networks. This file contributes to the overall client-side functionality of the repository. |

</details>

<details closed><summary>client.src</summary>

| File | Summary |
| --- | --- |
| [index.ts](https://github.com/amoinier/sockety/blob/main/client/src/index.ts) | Establishes a persistent WebSocket connection via the WSClient class, providing crucial real-time communication functionality. The script initiates connection attempts to a server specified by certain environment variables, and features automatic reconnection capability in the event of connection closure or errors. |

</details>

<details closed><summary>client.src.classes</summary>

| File | Summary |
| --- | --- |
| [WSClient.ts](https://github.com/amoinier/sockety/blob/main/client/src/classes/WSClient.ts) | WSClient establishes and manages WebSocket connections, enabling real-time, bi-directional communication between the client and server. It handles conversion of data between different formats and transfer of data over the WebSocket. It also provides error management and supports WebSocket lifecycle events including establishing connections, dealing with errors, and handling connection closure. |

</details>

---

##  Getting Started

###  Prerequisites

**TypeScript**: `version x.y.z`

###  Installation

Build the project from source:

1. Clone the sockety repository:
```sh
❯ git clone https://github.com/amoinier/sockety
```

2. Navigate to the project directory:
```sh
❯ cd sockety
```

3. Install the required dependencies:
```sh
❯ npm install
```

###  Usage

To run the project, execute the following command:

```sh
❯ npm run build && node dist/main.js
```

###  Tests

Execute the test suite using the following command:

```sh
❯ npm test
```

---

##  Project Roadmap

- [X] **`Task 1`**: <strike>Implement feature one.</strike>
- [ ] **`Task 2`**: Implement feature two.
- [ ] **`Task 3`**: Implement feature three.

---

##  Contributing

Contributions are welcome! Here are several ways you can contribute:

- **[Report Issues](https://github.com/amoinier/sockety/issues)**: Submit bugs found or log feature requests for the `sockety` project.
- **[Submit Pull Requests](https://github.com/amoinier/sockety/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.
- **[Join the Discussions](https://github.com/amoinier/sockety/discussions)**: Share your insights, provide feedback, or ask questions.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/amoinier/sockety
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com{/amoinier/sockety/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=amoinier/sockety">
   </a>
</p>
</details>

---

##  License

This project is protected under the [SELECT-A-LICENSE](https://choosealicense.com/licenses) License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/) file.

---

##  Acknowledgments

- List any resources, contributors, inspiration, etc. here.

---
