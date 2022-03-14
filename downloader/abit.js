const dsbmobile = require("dsbapi");
const mongoose = require('mongoose');
const Abit = require('./abit_model');
const { createWorker } = require('tesseract.js');
const {getMessaging} = require("firebase-admin/messaging");
const admin = require("firebase-admin");
const User = require('./user_model');
const logger = require('pino')();

(async () =>  {
    // Initialize .env file
    require('dotenv').config();
    // Connect to dsbmobile "api"
    const dsb = new dsbmobile(process.env.DSBMOBILE_ID, process.env.DSBMOBILE_PASSWORD);
    // Get timetables from dsb
    const timetables = dsbmobile.findMethodInData('timetable', await dsb.fetch());
    const url = timetables.data.filter((data) => {
        return data.title === 'Spots' && data.secondTitle === 'ABIT';
    })[0];
    logger.info("Downloaded ABIT information.");

    const worker = createWorker({});
    await worker.load();
    await worker.loadLanguage('deu')
    await worker.initialize('deu');
    const { data: { text }} = await worker.recognize(url.url);
    logger.info("Found text in image");
    await worker.terminate();


    let groups = [];
    text.match(/([5-9])|(1[0-3])([,\n])/g).forEach((group) => {
        groups.push(group.replace(',', '').replace('\n', ''));
    });
    logger.info("Found groups: " + groups)
    const date_str = text.match(/[0-9]{1,2}\.[0-9]{1,2}\.2022/)[0];
    const dateParts = date_str.split('.');
    let date = new Date(+dateParts[2], dateParts[1] -1, +dateParts[0]);
    date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

    const document = new Abit({
        date: date,
        groups: groups
    });
    // Store abit
    try {
        await document.save();
        // Send notification
        await sendNotification(groups);
    } catch (e) {
        const existing = await Abit.findOne({
            date: date
        });
        existing.groups = groups;
        for (let group of groups) {
            if (!existing.groups.includes(group)) {
                await sendNotification([group]);
            }
        }
        await existing.save();
    }
    await mongoose.disconnect();
})();

async function sendNotification(groups) {
    const serviceAccount = require("./serviceAccountKey.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    const messaging = getMessaging();

    for (let group of groups) {
        const users = await User.find({
            group: {
                $regex: group + "."
            },
            messagingToken: {
                $exists: true
            }
        });
        for (let user of users) {
            const message = {
                "token":  user.messagingToken,
                "notification": {
                    "title": "Du bist (weiterhin) im ABIT-Programm",
                    "body": "Dein Jahrgang befindet sich auch in der neu herausgegebenen Übersicht"
                }
            }
            await messaging.send(message).then((response) => {
                logger.info('Sent message: ' + response);
            })
        }
    }
}