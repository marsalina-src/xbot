import mongoose, { Schema, model, ObjectId } from "mongoose";
import { User } from "telegraf/typings/core/types/typegram";

interface IOrder extends User {
    email?: string,
    wallet?: string,
    usdt: string,
    coin: string,
    sum: number,
    summary: number
}

const orderSchema: Schema<IOrder> = new Schema<IOrder>({
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

const Order = model<IOrder>('Order', orderSchema);

export { Order, IOrder }
