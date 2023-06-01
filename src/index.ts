import dotenv from 'dotenv';
import customContext from './bot/models/customContext';
import { Scenes, Telegraf, session } from 'telegraf';

dotenv.config()
export const bot = new Telegraf<customContext>(process.env.BOT_TOKEN!)
// import './database'
import './app'

import home from './bot/views/home.scene';

const stage: any = new Scenes.Stage<customContext>([home], { default: 'home', ttl: 100000 });

bot.use(session())
bot.use(stage.middleware())
bot.launch()