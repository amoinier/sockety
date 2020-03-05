"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var ws_1 = __importDefault(require("ws"));
var Router = express_1.default.Router();
var wss = new ws_1.default.Server({ port: parseInt(process.env.WEBSOCKET_PORT) });
wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        console.log('received: %s', message);
    });
    ws.send('Server => Client');
});
Router.post('/', function (req, res) {
    var request = req.body;
    request.headers = Buffer.alloc(request.headers.length, request.headers, 'base64').toString('ascii');
    request.body = Buffer.alloc(request.body.length, request.body, 'base64').toString('ascii');
});
exports.default = Router;
