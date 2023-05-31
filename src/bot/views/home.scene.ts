import { Composer, Scenes } from "telegraf";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import customContext from "../models/customContext";
import { Order } from "../models/IOrder";
import { bot } from "../..";

const handler = new Composer<customContext>();
const home = new Scenes.WizardScene("home",
    handler,
    async (ctx: customContext) => await select_handler(ctx),
    async (ctx: customContext) => await change_handler(ctx),
    async (ctx: customContext) => await after_change_handler(ctx),
    async (ctx: customContext) => await sum_check(ctx),
    async (ctx: customContext) => await get_address(ctx),
    async (ctx: customContext) => await email(ctx)
);

async function email(ctx: customContext) {
    try {

        if (ctx.updateType === 'message') {
            ctx.scene.session.email = ctx.message.text
            console.log('Email адрес: ' + ctx.message.text)
            await ctx.deleteMessage(ctx.message.message_id)
            await ctx.deleteMessage(ctx.message.message_id - 1)
            let message: string = ``
            message += `Ваш кошелек: \n\n`
            message += `<b>${ctx.scene.session.wallet}</b> \n\n`
            message += `Сумма перевода: ${ctx.scene.session.sum} ${ctx.scene.session.web} \n\n`
            message += `Итого: <b>${ctx.scene.session.summary} ${ctx.scene.session.web2.toUpperCase()}</b>\n\n`
            message += `Откройте клиент, с которого вы будете переводить USDT, и введите следующую информацию:\n\n`
            message += `!! ${ctx.scene.session.web} !!\n\n`
            message += `!! Ваш билет создан, внесите указанную в заявке сумму USDT на указанный в заявке сумму USDT на указанный ниже кошелек, после оплаты нажмите кнопку <b>Я оплатил</b> !!\n\n`
            message += `<code>адрес кошелька</code>\n\n`

            const extra: ExtraEditMessageText = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Я оплатил', callback_data: 'payed' }],
                        [{ text: 'Отменить заявку', callback_data: 'cancel' }]
                    ]
                }
            }

            let userdata = {
                email: ctx.scene.session.email,
                wallet: ctx.scene.session.wallet,
                usdt: ctx.scene.session.web,
                coin: ctx.scene.session.web2,
                sum: ctx.scene.session.sum,
                summary: ctx.scene.session.summary
            }

            await new Order({
                id: ctx.from?.id,
                username: ctx.from?.username,
                first_name: ctx.from?.first_name,
                last_name: ctx.from?.last_name,
                email: ctx.scene.session.email,
                wallet: ctx.scene.session.wallet,
                usdt: ctx.scene.session.web,
                coin: ctx.scene.session.web2,
                sum: ctx.scene.session.sum,
                summary: ctx.scene.session.summary
            }).save().then(async () => {
                if (process.env.chatid) {
                    await ctx.telegram.sendMessage(process.env.chatid, message, { parse_mode: 'HTML' })
                }
            }).catch(err => {
                console.error(err)
            })

            await ctx.reply(message, extra)
        }

        if (ctx.updateType === 'callback_query') {
            if (ctx.update.callback_query.data === 'payed') {

                let message: string = `☑️ Ваш заказ принят!\n\n`
                message += `Ордер создан!\n`
                message += `Вы обменяли: <b>${ctx.scene.session.sum} ${ctx.scene.session.web}</b>\n`
                message += `на: <b>${ctx.scene.session.summary} ${ctx.scene.session.web2.toUpperCase()}</b>\n`
                message += `Статус ордера:\n`
                message += `⏱ Ожидается поступление средств...`
                
                let extra: ExtraEditMessageText = {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'В главное меню', callback_data: 'tohome' }]
                        ]
                    }
                }

                ctx.answerCbQuery()
                await ctx.editMessageText(message, extra)

            }

            if (ctx.update.callback_query.data === 'tohome') {
                ctx.answerCbQuery()
                ctx.wizard.selectStep(0)
                await greeting(ctx)
            }
        }

    } catch (err) {
        console.error(err)
        return err
    }
}

async function get_address (ctx: customContext) {
    try {

        if (ctx.updateType === 'message') {
            ctx.scene.session.wallet = ctx.message.text
            console.log('Адрес кошелька: ' + ctx.message.text)
            await ctx.deleteMessage(ctx.message.message_id)
            await ctx.deleteMessage(ctx.message.message_id - 1)
            await ctx.reply(`Введите ваш Email адрес для подтверждения транзакции`)
            ctx.wizard.selectStep(6)
        }

    } catch (err) {
        console.error(err)
        return err
    }
}

async function sum_check (ctx: customContext) {
    try {

        if (ctx.updateType === 'message') {
            let sum = parseFloat(ctx.message.text)

            if (sum) {

                ctx.scene.session.sum = sum
                let message: string = `Вы ввели следующую сумму: ${sum} ${ctx.scene.session.web}`
                let extra: ExtraEditMessageText = {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Продолжить', callback_data: 'continue' }],
                            [{ text: 'Отменить заявку', callback_data: 'cancel' }]
                        ]
                    }
                }

                await ctx.deleteMessage(ctx.message.message_id)
                await ctx.deleteMessage(ctx.message.message_id-1)
                await ctx.reply(message, extra)

            }

        }

        if (ctx.updateType === 'callback_query') {

            let data: string = ctx.update.callback_query.data

            if (data === 'cancel') {
                ctx.scene.session.sum = 0
                ctx.answerCbQuery('Заявка отменена')
                await greeting(ctx)
                ctx.wizard.selectStep(0)
            }

            if (data === 'continue') {

                await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=USDT&convert=${ctx.scene.session.web2.toUpperCase()}&CMC_PRO_API_KEY=${process.env.api}`)
                    .then(async (res) => res.json())
                    .then(data => {

                        let quote
                        if (ctx.scene.session.web2.toUpperCase() === 'BTC') {
                            quote = data.data.USDT.quote.BTC.price
                        } else if (ctx.scene.session.web2.toUpperCase() === 'TRX') {
                            quote = data.data.USDT.quote.TRX.price
                        }
                        ctx.wizard.selectStep(5)
                        let message: string = `Вы ввели ${ctx.scene.session.sum} ${ctx.scene.session.web}\n\n`
                        message += `Вы получаете: ${(quote * ctx.scene.session.sum).toFixed(10)} ${ctx.scene.session.web2.toUpperCase()}`
                        message += `\n\nВведите свой кошелек ${ctx.scene.session.web2.toUpperCase()}, на который вы хотите получить ${ctx.scene.session.web}`
                        ctx.scene.session.summary = (quote * ctx.scene.session.sum).toFixed(10)
                        ctx.editMessageText(message)
                        console.log('1 USDT = ' + quote + ` ${ctx.scene.session.web2.toUpperCase()}`)
                    })
                    .catch(err => console.error(err))

            }

        }

    } catch (err) {
        console.error(err)
        return err
    }
}

async function after_change_handler(ctx: customContext) {
    try {

        if (ctx.updateType === 'callback_query') {

            let data: string = ctx.update.callback_query.data

            if (data === 'back') {
                ctx.answerCbQuery()
                ctx.wizard.selectStep(2)
                let message: string = `Выберите какую монету вы хотите получить`
                const extra: ExtraEditMessageText = {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Обмен USDT на BTC', callback_data: 'btc' }],
                            [{ text: 'Обмен USDT на TRX', callback_data: 'trx' }],
                            [{ text: 'Назад', callback_data: 'back' }],
                        ]
                    }
                }

                await ctx.editMessageText(message, extra)
            }

            if (data === 'send_sum') {
                ctx.answerCbQuery()
                ctx.wizard.selectStep(4)
                let message: string = `Сколько USDT вы хотите обменять? \n`
                message += `!! Минимальный порог - 50 USDT !!`
                ctx.editMessageText(message)
            }


        } else {
            await render_data_select(ctx)
        }

    } catch (err) {
        console.error(err)
        return err
    }
}

async function render_data_select(ctx: customContext, data?: string) {

    if (data) {
        ctx.scene.session.web2 = data
    }
    let message: string = `Вы хотите обменять: ${ctx.scene.session.web} на ${ctx.scene.session.web2.toUpperCase()}`
        
    await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${ctx.scene.session.web2.toUpperCase()}&convert=USDT&CMC_PRO_API_KEY=${process.env.api}`)
        .then(async (res) => res.json())
        .then(data => {

            let quote
            let cap
            if (ctx.scene.session.web2.toUpperCase() === 'BTC') {
                quote = data.data.BTC.quote.USDT
                cap = data.data.BTC.quote.USDT.market_cap    
            } else if (ctx.scene.session.web2.toUpperCase() === 'TRX') {
                quote = data.data.TRX.quote.USDT
                cap = data.data.TRX.quote.USDT.market_cap
            }

            console.log(quote)

            ctx.scene.session.coinQoute = quote.price - (quote.price / 100 * 9)
            message += `\n\nОбменный курс: 1 ${ctx.scene.session.web2.toUpperCase()} = ${ctx.scene.session.coinQoute.toFixed(5)} ${ctx.scene.session.web}`
            // message += `\n\nРезерв: 20000.0 USDT`
            // message += `\n\nРезерв: 20000.0 USDT`
            
            if (ctx.scene.session.web2.toUpperCase() === 'BTC') {
                message += `\n\nРезерв: ~0,74 BTC`
            } else {
                message += `\n\nРезерв: ~265740,80 TRX`
            }

            message += `\n\nМинимальная сумма обмена USDT на ${ctx.scene.session.web2.toUpperCase()} = 50.0 USDT\n`
            message += `Максимальная сумма обмена USDT на ${ctx.scene.session.web2.toUpperCase()} = 100000.0 USDT`

        })
        .catch(err => console.error(err))

    const extra: ExtraEditMessageText = {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Ввести сумму USDT', callback_data: 'send_sum' }],
                [{ text: 'Назад', callback_data: 'back' }]
            ]
        }
    }

    if (ctx.updateType === 'callback_query') {
        ctx.editMessageText(message, extra)
    } else {
        ctx.reply(message, extra)
    }
    
    ctx.wizard.selectStep(3)
}

async function change_handler(ctx: customContext) {
    try {

        if (ctx.updateType === 'callback_query') {

            let data: 'btc' | 'trx' | 'back' = ctx.update.callback_query.data

            if (data === 'back') {

                ctx.wizard.selectStep(1)
                await render_select_section(ctx)

            }

            if (data === 'trx' || data === 'btc') {

                await render_data_select(ctx, data)

            }

            ctx.answerCbQuery()

        } else {

            let message: string = `Выберите какую монету вы хотите получить`
            const extra: ExtraEditMessageText = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Обмен USDT на BTC', callback_data: 'btc' }],
                        [{ text: 'Обмен USDT на TRX', callback_data: 'trx' }],
                        [{ text: 'Назад', callback_data: 'back' }],
                    ]
                }
            }

            await ctx.reply(message, extra)

        }

    } catch (err) {

        return err

    }
}

async function greeting(ctx: customContext) {



    const extra: ExtraEditMessageText = {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Обмен USDT', callback_data: 'change' }],
                [{ url: 'http://t.me/frntdev', text: 'Поддержка' }]
            ]
        }
    }

    let message = `Добро пожаловать на биржу TRON!`
    message += `\n\nЭтот бот создан компанией "TRON Limited" для самого быстрого обмена ваших USDT на TRX и BTC.`
    message += `\n\n📈 Наши преимущества:`
    message += `\n1). Автоматический обмен`
    message += `\n2). Самый выгодный курс`
    message += `\n3). Отзывчивая поддержка`

    try {

        ctx.updateType === 'message' ? await ctx.reply(message, extra) : false
        ctx.updateType === 'callback_query' ? await ctx.editMessageText(message, extra) : false


    } catch (err) {

        console.error(err);

    }
}

async function select_handler(ctx: customContext) {
    try {

        if (ctx.updateType === 'callback_query') {

            let data: string = ctx.update.callback_query.data
            ctx.answerCbQuery(data)

            if (data === 'back') {
                ctx.wizard.selectStep(0)
                await greeting(ctx)
            }

            if (data === 'bep' || data === 'trc') {

                ctx.wizard.selectStep(2)

                if (data === 'bep') {
                    ctx.scene.session.web = 'USDT (BEP-20)'
                } else {
                    ctx.scene.session.web = 'USDT (TRC-20)'
                }

                let message: string = `Выберите какую монету вы хотите получить`
                const extra: ExtraEditMessageText = {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Обмен USDT на BTC', callback_data: 'btc' }],
                            [{ text: 'Обмен USDT на TRX', callback_data: 'trx' }],
                            [{ text: 'Назад', callback_data: 'back' }],
                        ]
                    }
                }

                await ctx.editMessageText(message, extra)

            }

        } else {
            render_select_section(ctx)
        }

    } catch (err) {
        console.error(err)
        return false
    }
}

home.enter(async (ctx) => { return await greeting(ctx) })
home.action('change', async (ctx: customContext) => render_select_section(ctx))
async function render_select_section(ctx: customContext) {
    try {

        let message: string = `Выберите в какой сети вы хотите обменивать`
        const extra: ExtraEditMessageText = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'USDT (TRC-20)', callback_data: 'trc' }],
                    [{ text: "USDT (BEP-20)", callback_data: "bep" }],
                    [{ text: "Назад", callback_data: 'back' }]
                ]
            }
        }

        if (ctx.updateType === 'callback_query') {
            await ctx.editMessageText(message, extra)
            ctx.wizard.selectStep(1)
        } else {
            await ctx.reply(message, extra)
        }

    } catch (err) {
        console.error(err)
        return err
    }
}

handler.on("message", async (ctx) => await greeting(ctx))
handler.action(/\./, async (ctx) => await greeting(ctx))
export default home