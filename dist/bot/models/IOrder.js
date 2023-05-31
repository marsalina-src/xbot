"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    id: { type: Number, required: true },
    username: { type: String, required: false },
    first_name: { type: String, required: false },
    last_name: { type: String, required: false },
    email: { type: String, required: false },
    wallet: { type: String, required: false },
    usdt: { type: String, required: true },
    coin: { type: String, required: true },
    sum: { type: Number, required: true },
    summary: { type: Number, required: true }
}, {
    timestamps: true
});
const Order = (0, mongoose_1.model)('Order', orderSchema);
exports.Order = Order;
//# sourceMappingURL=IOrder.js.map