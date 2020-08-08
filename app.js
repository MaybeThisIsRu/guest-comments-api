"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var v1_1 = __importDefault(require("./routes/api/v1"));
var app = express_1.default();
var port = 4000 || process.env.PORT;
app.use(express_1.default.urlencoded({ extended: false }));
app.use("/api/v1", v1_1.default);
app.listen(port, function () {
    console.log("web-comments listening at http://localhost:" + port);
});
