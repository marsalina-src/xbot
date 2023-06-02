import express from 'express';
import bodyParser from 'body-parser';
import { ObjectId } from 'mongodb';
import { bot } from './index';
import cors from 'cors';
import morgan from 'morgan';

const PORT = process.env.PORT;
const app = express();
export const secretPath = `/telegraf/secret_path2`;

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

// Handle POST request to '/bot'
app.post(secretPath, (req, res) => {
    bot.handleUpdate(req.body, res);
});

app.get('/', (req, res) => res.send('Бот запущен!'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const fetchData = async () => {
    const res = await fetch('http://localhost:4040/api/tunnels');
    const json = await res.json();
    console.log(json);
    //@ts-ignore
    const secureTunnel = json.tunnels[0].public_url;
    console.log(secureTunnel);
    await bot.telegram
        .setWebhook(`${secureTunnel}${secretPath}`)
        .then((res) => {
            console.log(res);
        });
};

async function setWebhook() {
    console.log(`${process.env.mode?.replace(/"/g, '')}`);
    if (`${process.env.mode?.replace(/"/g, '')}` === 'production') {
        console.log(`${process.env.mode?.replace(/"/g, '')}`);
        console.log(`secret path: ${secretPath}`);
        await bot.telegram
            .setWebhook(`https://profori.pro${secretPath}`)
            .then((status) => {
                console.log(secretPath);
                console.log(status);
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        await fetchData().catch((error: any) => {
            console.error('Error setting webhook:', error);
        });
    }
}

setWebhook();
