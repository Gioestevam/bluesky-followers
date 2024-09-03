import { AtpAgent } from '@atproto/api';
import { CronJob } from 'cron';
import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

const agent = new AtpAgent({
    service: 'https://bsky.social',
})

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    })
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

const scheduleExpression = '0 0 0/24 * * *'; 

const job = new CronJob(scheduleExpression, createPost);

try {
    job.start();
} catch (e) {
    console.error(e);
}
