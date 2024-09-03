import { AtpAgent } from '@atproto/api';
import { CronJob } from 'cron';
import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore';

const fs = require('node:fs');

dotenv.config();

const path = './src/counter.txt';

const agent = new AtpAgent({
    service: 'https://bsky.social',
})

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
  
const db = getFirestore();

type Counter = {
    days: number
}

async function addCounterInFirestore(): Promise<Counter> {
    const docRef = db.collection('twitter-counters').doc('counter');

    const counterDocData = await docRef.get();

    const counter = counterDocData.data() as Counter; 

    docRef.update({ days: ++counter.days });

    return counter;
}

async function createPost() {
    const counter = await addCounterInFirestore();
    
    console.info(`Contador de Dias: ${counter.days} dias`);

   await agent.login({ identifier: process.env.BLUESKY_USER!, password: process.env.BLUESKY_PASSWORD!});

    await agent.post({
        text: `Estamos a ${counter.days} dias sem o esgoto do Twitter/X`
    });
}

createPost();

const scheduleExpression = '0 0 0/24 * * *'; 

const job = new CronJob(scheduleExpression, createPost);

job.start();
