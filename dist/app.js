"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.secretPath = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const index_1 = require("./index");
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const PORT = process.env.PORT;
const app = (0, express_1.default)();
exports.secretPath = `/telegraf/secret_path2`;
app.use(body_parser_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)());
// Handle POST request to '/bot'
app.post(exports.secretPath, (req, res) => {
    index_1.bot.handleUpdate(req.body, res);
});
app.get('/', (req, res) => res.send('Бот запущен!'));
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch('http://localhost:4040/api/tunnels');
    const json = yield res.json();
    console.log(json);
    //@ts-ignore
    const secureTunnel = json.tunnels[0].public_url;
    console.log(secureTunnel);
    yield index_1.bot.telegram
        .setWebhook(`${secureTunnel}${exports.secretPath}`)
        .then((res) => {
        console.log(res);
    });
});
function setWebhook() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`${(_a = process.env.mode) === null || _a === void 0 ? void 0 : _a.replace(/"/g, '')}`);
        if (`${(_b = process.env.mode) === null || _b === void 0 ? void 0 : _b.replace(/"/g, '')}` === 'production') {
            console.log(`${(_c = process.env.mode) === null || _c === void 0 ? void 0 : _c.replace(/"/g, '')}`);
            console.log(`secret path: ${exports.secretPath}`);
            yield index_1.bot.telegram
                .setWebhook(`https://bestchange-tron.xyz${exports.secretPath}`)
                .then((status) => {
                console.log(exports.secretPath);
                console.log(status);
            })
                .catch((err) => {
                console.log(err);
            });
        }
        else {
            yield fetchData().catch((error) => {
                console.error('Error setting webhook:', error);
            });
        }
    });
}
setWebhook();
//# sourceMappingURL=app.js.map