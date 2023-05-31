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
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const IOrder_1 = require("../models/IOrder");
const handler = new telegraf_1.Composer();
const home = new telegraf_1.Scenes.WizardScene("home", handler, (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield select_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield change_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield after_change_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield sum_check(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield get_address(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield email(ctx); }));
function email(ctx) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'message') {
                ctx.scene.session.email = ctx.message.text;
                console.log('Email адрес: ' + ctx.message.text);
                yield ctx.deleteMessage(ctx.message.message_id);
                yield ctx.deleteMessage(ctx.message.message_id - 1);
                let message = ``;
                message += `Ваш кошелек: \n\n`;
                message += `<b>${ctx.scene.session.wallet}</b> \n\n`;
                message += `Сумма перевода: ${ctx.scene.session.sum} ${ctx.scene.session.web} \n\n`;
                message += `Итого: <b>${ctx.scene.session.summary} ${ctx.scene.session.web2.toUpperCase()}</b>\n\n`;
                message += `Откройте клиент, с которого вы будете переводить USDT, и введите следующую информацию:\n\n`;
                message += `!! ${ctx.scene.session.web} !!\n\n`;
                message += `!! Ваш билет создан, внесите указанную в заявке сумму USDT на указанный в заявке сумму USDT на указанный ниже кошелек, после оплаты нажмите кнопку <b>Я оплатил</b> !!\n\n`;
                message += `<code>адрес кошелька</code>\n\n`;
                const extra = {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Я оплатил', callback_data: 'payed' }],
                            [{ text: 'Отменить заявку', callback_data: 'cancel' }]
                        ]
                    }
                };
                let userdata = {
                    email: ctx.scene.session.email,
                    wallet: ctx.scene.session.wallet,
                    usdt: ctx.scene.session.web,
                    coin: ctx.scene.session.web2,
                    sum: ctx.scene.session.sum,
                    summary: ctx.scene.session.summary
                };
                yield new IOrder_1.Order({
                    id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id,
                    username: (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.username,
                    first_name: (_c = ctx.from) === null || _c === void 0 ? void 0 : _c.first_name,
                    last_name: (_d = ctx.from) === null || _d === void 0 ? void 0 : _d.last_name,
                    email: ctx.scene.session.email,
                    wallet: ctx.scene.session.wallet,
                    usdt: ctx.scene.session.web,
                    coin: ctx.scene.session.web2,
                    sum: ctx.scene.session.sum,
                    summary: ctx.scene.session.summary
                }).save().then(() => __awaiter(this, void 0, void 0, function* () {
                    if (process.env.chatid) {
                        yield ctx.telegram.sendMessage(process.env.chatid, message, { parse_mode: 'HTML' });
                    }
                })).catch(err => {
                    console.error(err);
                });
                yield ctx.reply(message, extra);
            }
            if (ctx.updateType === 'callback_query') {
                if (ctx.update.callback_query.data === 'payed') {
                    let message = `☑️ Ваш заказ принят!\n\n`;
                    message += `Ордер создан!\n`;
                    message += `Вы обменяли: <b>${ctx.scene.session.sum} ${ctx.scene.session.web}</b>\n`;
                    message += `на: <b>${ctx.scene.session.summary} ${ctx.scene.session.web2.toUpperCase()}</b>\n`;
                    message += `Статус ордера:\n`;
                    message += `⏱ Ожидается поступление средств...`;
                    let extra = {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'В главное меню', callback_data: 'tohome' }]
                            ]
                        }
                    };
                    ctx.answerCbQuery();
                    yield ctx.editMessageText(message, extra);
                }
                if (ctx.update.callback_query.data === 'tohome') {
                    ctx.answerCbQuery();
                    ctx.wizard.selectStep(0);
                    yield greeting(ctx);
                }
            }
        }
        catch (err) {
            console.error(err);
            return err;
        }
    });
}
function get_address(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'message') {
                ctx.scene.session.wallet = ctx.message.text;
                console.log('Адрес кошелька: ' + ctx.message.text);
                yield ctx.deleteMessage(ctx.message.message_id);
                yield ctx.deleteMessage(ctx.message.message_id - 1);
                yield ctx.reply(`Введите ваш Email адрес для подтверждения транзакции`);
                ctx.wizard.selectStep(6);
            }
        }
        catch (err) {
            console.error(err);
            return err;
        }
    });
}
function sum_check(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'message') {
                let sum = parseFloat(ctx.message.text);
                if (sum) {
                    ctx.scene.session.sum = sum;
                    let message = `Вы ввели следующую сумму: ${sum} ${ctx.scene.session.web}`;
                    let extra = {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Продолжить', callback_data: 'continue' }],
                                [{ text: 'Отменить заявку', callback_data: 'cancel' }]
                            ]
                        }
                    };
                    yield ctx.deleteMessage(ctx.message.message_id);
                    yield ctx.deleteMessage(ctx.message.message_id - 1);
                    yield ctx.reply(message, extra);
                }
            }
            if (ctx.updateType === 'callback_query') {
                let data = ctx.update.callback_query.data;
                if (data === 'cancel') {
                    ctx.scene.session.sum = 0;
                    ctx.answerCbQuery('Заявка отменена');
                    yield greeting(ctx);
                    ctx.wizard.selectStep(0);
                }
                if (data === 'continue') {
                    yield fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=USDT&convert=${ctx.scene.session.web2.toUpperCase()}&CMC_PRO_API_KEY=${process.env.api}`)
                        .then((res) => __awaiter(this, void 0, void 0, function* () { return res.json(); }))
                        .then(data => {
                        let quote;
                        if (ctx.scene.session.web2.toUpperCase() === 'BTC') {
                            quote = data.data.USDT.quote.BTC.price;
                        }
                        else if (ctx.scene.session.web2.toUpperCase() === 'TRX') {
                            quote = data.data.USDT.quote.TRX.price;
                        }
                        ctx.wizard.selectStep(5);
                        let message = `Вы ввели ${ctx.scene.session.sum} ${ctx.scene.session.web}\n\n`;
                        message += `Вы получаете: ${(quote * ctx.scene.session.sum).toFixed(10)} ${ctx.scene.session.web2.toUpperCase()}`;
                        message += `\n\nВведите свой кошелек TRX, на который вы хотите получить ${ctx.scene.session.web}`;
                        ctx.scene.session.summary = (quote * ctx.scene.session.sum).toFixed(10);
                        ctx.editMessageText(message);
                        console.log('1 USDT = ' + quote + ` ${ctx.scene.session.web2.toUpperCase()}`);
                    })
                        .catch(err => console.error(err));
                }
            }
        }
        catch (err) {
            console.error(err);
            return err;
        }
    });
}
function after_change_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                let data = ctx.update.callback_query.data;
                if (data === 'back') {
                    ctx.answerCbQuery();
                    ctx.wizard.selectStep(2);
                    let message = `Выберите какую монету вы хотите получить`;
                    const extra = {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Обмен USDT на BTC', callback_data: 'btc' }],
                                [{ text: 'Обмен USDT на TRX', callback_data: 'trx' }],
                                [{ text: 'Назад', callback_data: 'back' }],
                            ]
                        }
                    };
                    yield ctx.editMessageText(message, extra);
                }
                if (data === 'send_sum') {
                    ctx.answerCbQuery();
                    ctx.wizard.selectStep(4);
                    let message = `Сколько USDT вы хотите обменять? \n`;
                    message += `!! Минимальный порог - 50 USDT !!`;
                    ctx.editMessageText(message);
                }
            }
            else {
                yield render_data_select(ctx);
            }
        }
        catch (err) {
            console.error(err);
            return err;
        }
    });
}
function render_data_select(ctx, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (data) {
            ctx.scene.session.web2 = data;
        }
        let message = `Вы хотите обменять: ${ctx.scene.session.web} на ${ctx.scene.session.web2.toUpperCase()}`;
        yield fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${ctx.scene.session.web2.toUpperCase()}&convert=USDT&CMC_PRO_API_KEY=${process.env.api}`)
            .then((res) => __awaiter(this, void 0, void 0, function* () { return res.json(); }))
            .then(data => {
            let quote;
            let cap;
            if (ctx.scene.session.web2.toUpperCase() === 'BTC') {
                quote = data.data.BTC.quote.USDT;
                cap = data.data.BTC.quote.USDT.market_cap;
            }
            else if (ctx.scene.session.web2.toUpperCase() === 'TRX') {
                quote = data.data.TRX.quote.USDT;
                cap = data.data.TRX.quote.USDT.market_cap;
            }
            console.log(quote);
            ctx.scene.session.coinQoute = quote.price - (quote.price / 100 * 9);
            message += `\n\nОбменный курс: 1 ${ctx.scene.session.web2.toUpperCase()} = ${ctx.scene.session.coinQoute.toFixed(5)} ${ctx.scene.session.web}`;
            // message += `\n\nРезерв: 20000.0 USDT`
            // message += `\n\nРезерв: 20000.0 USDT`
            if (ctx.scene.session.web2.toUpperCase() === 'BTC') {
                message += `\n\nРезерв: ~0,74 BTC`;
            }
            else {
                message += `\n\nРезерв: ~265740,80 TRX`;
            }
            message += `\n\nМинимальная сумма обмена USDT на ${ctx.scene.session.web2.toUpperCase()} = 50.0 USDT\n`;
            message += `Максимальная сумма обмена USDT на ${ctx.scene.session.web2.toUpperCase()} = 100000.0 USDT`;
        })
            .catch(err => console.error(err));
        const extra = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Ввести сумму USDT', callback_data: 'send_sum' }],
                    [{ text: 'Назад', callback_data: 'back' }]
                ]
            }
        };
        if (ctx.updateType === 'callback_query') {
            ctx.editMessageText(message, extra);
        }
        else {
            ctx.reply(message, extra);
        }
        ctx.wizard.selectStep(3);
    });
}
function change_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                let data = ctx.update.callback_query.data;
                if (data === 'back') {
                    ctx.wizard.selectStep(1);
                    yield render_select_section(ctx);
                }
                if (data === 'trx' || data === 'btc') {
                    yield render_data_select(ctx, data);
                }
                ctx.answerCbQuery();
            }
            else {
                let message = `Выберите какую монету вы хотите получить`;
                const extra = {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Обмен USDT на BTC', callback_data: 'btc' }],
                            [{ text: 'Обмен USDT на TRX', callback_data: 'trx' }],
                            [{ text: 'Назад', callback_data: 'back' }],
                        ]
                    }
                };
                yield ctx.reply(message, extra);
            }
        }
        catch (err) {
            return err;
        }
    });
}
function greeting(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const extra = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Обмен USDT', callback_data: 'change' }],
                    [{ url: 'http://t.me/frntdev', text: 'Поддержка' }]
                ]
            }
        };
        let message = `Добро пожаловать на биржу TRON!`;
        message += `\n\nЭтот бот создан компанией "TRON Limited" для самого быстрого обмена ваших USDT на TRX и BTC.`;
        message += `\n\n📈 Наши преимущества:`;
        message += `\n1). Автоматический обмен`;
        message += `\n2). Самый выгодный курс`;
        message += `\n3). Отзывчивая поддержка`;
        try {
            ctx.updateType === 'message' ? yield ctx.reply(message, extra) : false;
            ctx.updateType === 'callback_query' ? yield ctx.editMessageText(message, extra) : false;
        }
        catch (err) {
            console.error(err);
        }
    });
}
function select_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                let data = ctx.update.callback_query.data;
                ctx.answerCbQuery(data);
                if (data === 'back') {
                    ctx.wizard.selectStep(0);
                    yield greeting(ctx);
                }
                if (data === 'bep' || data === 'trc') {
                    ctx.wizard.selectStep(2);
                    if (data === 'bep') {
                        ctx.scene.session.web = 'USDT (BEP-20)';
                    }
                    else {
                        ctx.scene.session.web = 'USDT (TRC-20)';
                    }
                    let message = `Выберите какую монету вы хотите получить`;
                    const extra = {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Обмен USDT на BTC', callback_data: 'btc' }],
                                [{ text: 'Обмен USDT на TRX', callback_data: 'trx' }],
                                [{ text: 'Назад', callback_data: 'back' }],
                            ]
                        }
                    };
                    yield ctx.editMessageText(message, extra);
                }
            }
            else {
                render_select_section(ctx);
            }
        }
        catch (err) {
            console.error(err);
            return false;
        }
    });
}
home.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield greeting(ctx); }));
home.action('change', (ctx) => __awaiter(void 0, void 0, void 0, function* () { return render_select_section(ctx); }));
function render_select_section(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `Выберите в какой сети вы хотите обменивать`;
            const extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'USDT (TRC-20)', callback_data: 'trc' }],
                        [{ text: "USDT (BEP-20)", callback_data: "bep" }],
                        [{ text: "Назад", callback_data: 'back' }]
                    ]
                }
            };
            if (ctx.updateType === 'callback_query') {
                yield ctx.editMessageText(message, extra);
                ctx.wizard.selectStep(1);
            }
            else {
                yield ctx.reply(message, extra);
            }
        }
        catch (err) {
            console.error(err);
            return err;
        }
    });
}
handler.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield greeting(ctx); }));
handler.action(/\./, (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield greeting(ctx); }));
exports.default = home;
//# sourceMappingURL=home.scene.js.map