"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const telegraf_1 = require("telegraf");
dotenv_1.default.config();
exports.bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
// import './database'
require("./app");
const home_scene_1 = __importDefault(require("./bot/views/home.scene"));
const stage = new telegraf_1.Scenes.Stage([home_scene_1.default], { default: 'home', ttl: 100000 });
exports.bot.use((0, telegraf_1.session)());
exports.bot.use(stage.middleware());
exports.bot.launch();
//# sourceMappingURL=index.js.map