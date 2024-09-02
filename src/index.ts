import { AtpAgent } from '@atproto/api';
import { CronJob } from 'cron';
import * as dotenv from 'dotenv';

const fs = require('node:fs');

dotenv.config();

const path = './src/counter.txt';

const agent = new AtpAgent({
    service: 'https://bsky.social',
})

async function createOrReadCounterFile() {
    if (!fs.existsSync(path)) {
        let counterInitial = '1';
        fs.writeFileSync(path, counterInitial);

        return counterInitial;
    }

    let counter = await fs.readFileSync(path, 'utf8');

    await fs.writeFileSync(path, (++counter).toString(), { flag: 'w' });
    
    return counter;
}

async function createPost() {
    const counter = await createOrReadCounterFile();
    
    console.info(`Contador de Dias: ${counter} dias`);

    await agent.login({ identifier: process.env.BLUESKY_USER!, password: process.env.BLUESKY_PASSWORD!});

    await agent.post({
        text: `Estamos a ${counter} dias sem o esgoto do Twitter/X`
    });

}
const scheduleExpression = '0 0 0/24 * * *'; 

createPost();

const job = new CronJob(scheduleExpression, createPost);

job.start();