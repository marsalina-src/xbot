"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect(`mongodb://127.0.0.1:27017/xbot?authSource=admin`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).catch(error => { console.error(error); });
mongoose_1.default.connection.on('connected', () => {
    console.log('Connected to MongoDB!');
});
//# sourceMappingURL=database.js.map