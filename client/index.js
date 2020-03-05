"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = __importDefault(require("ws"));
var ws = new ws_1.default('ws://localhost:8000');
ws.on('open', function () {
    ws.send('Client => Server');
});
ws.on('message', function (data) {
    console.log(data);
});
