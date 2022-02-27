const mongoose = require('mongoose');
const jsdom = require('jsdom');
const Constitution = require('./constitution_model');
const dsbmobile = require('dsbapi');
const axios = require('axios');
const logger = require('pino')();
const admin = require('firebase-admin');
const User = require('./user_model')
const {getMessaging} = require("firebase-admin/messaging");

(async () => {
    // Initialize .env file
    require('dotenv').config();

    // Connect to dsbmobile "api"
    const dsb = new dsbmobile(process.env.DSBMOBILE_ID, process.env.DSBMOBILE_PASSWORD);
    // Get timetables from dsb
    const timetables = dsbmobile.findMethodInData('timetable', await dsb.fetch());
    // Get plans for next day
    const first_plan = await download(timetables, 'Lehrer Heute');
    // Get plans for day after next
    const second_plan = await download(timetables, 'Lehrer Morgen');

    // Connect to mongodb database
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    // Save constitutions from plans to database
    await save(new jsdom.JSDOM(first_plan).window.document);
    await save(new jsdom.JSDOM(second_plan).window.document);

    // Disconnect database
    await mongoose.disconnect();
})();

async function save(document) {
    // Get date string from plan
    let day = document.getElementsByClassName('mon_title')[0].textContent;
    const date_str = day.match('[1-9]{1,2}\\.[1-9]{1,2}\\.2022')[0];
    const dateParts = date_str.split('.');
    // Get js date from string date
    let date = new Date(+dateParts[2], dateParts[1] -1, +dateParts[0]);
    date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);

    // Get even entries and process them
    const items_even = document.getElementsByClassName('list even');
    for (let i = 0; i < items_even.length; i++) {
        const details = items_even[i].getElementsByTagName('td');
        await process(details, date);
    }

    // Get odd entries and process them
    const items_odd = document.getElementsByClassName('list odd');
    for (let i = 0; i < items_odd.length; i++) {
        const details = items_odd[i].getElementsByTagName('td');
        await process(details, date);
    }
}

function compare(first_doc, second_doc) {
    return first_doc.id === second_doc.id && first_doc.hour === second_doc.hour
    && first_doc.group.toString() === second_doc.group.toString()
    && first_doc.teacher_old === second_doc.teacher_old && first_doc.teacher_new === second_doc.teacher_new
    && first_doc.topic_old === second_doc.topic_old && first_doc.room_old === second_doc.room_old
    && first_doc.topic_new === second_doc.topic_new && first_doc.room_new === second_doc.room_new
    && first_doc.moved_from === second_doc.moved_from && first_doc.info === second_doc.info
    && first_doc.cancelled === second_doc.cancelled && first_doc.date.toString() === second_doc.date.toString()
}

async function download(timetables, title) {
    logger.info('Downloading plan with the title: ' + title);

    // Get table with given date
    const table = timetables.data.filter(function (data) {
        return data.title === title;
    })[0];
    const url = table.objects[0].url;

    // Download plan
    const response = await axios.get(url);
    return response.data;
}

async function process(details, date) {
    // Create document
    const new_const = new Constitution({
        id: Number.parseInt(details[0].textContent),
        hour: details[1].textContent,
        group: details[2].textContent.split(', '),
        teacher_old: details[3].textContent,
        teacher_new: details[4].textContent,
        topic_old: details[5].textContent,
        room_old: details[6].textContent,
        topic_new: details[7].textContent,
        room_new: details[8].textContent,
        moved_from: details[9].textContent,
        info: details[10].textContent,
        cancelled: details[11].textContent === 'x',
        date: date
    });

    // Get existing document, if there is any
    const found = await Constitution.findOne({
        id: Number.parseInt(details[0].textContent),
        date: date
    });
    if (found !== null) {
        if (!compare(found, new_const)) {
            // Modify found document if existent
            logger.info('Constitution with the id ' + new_const.id + ' has changes. ');
            await Constitution.findOneAndReplace({
                id: new_const.id
            }, {
                id: Number.parseInt(details[0].textContent),
                hour: details[1].textContent,
                group: details[2].textContent.split(', '),
                teacher_old: details[3].textContent,
                teacher_new: details[4].textContent,
                topic_old: details[5].textContent,
                room_old: details[6].textContent,
                topic_new: details[7].textContent,
                room_new: details[8].textContent,
                moved_from: details[9].textContent,
                info: details[10].textContent,
                cancelled: details[11].textContent === 'x',
                date: date,
            });
            // Send change notification
            for (let group of new_const.group) {
                await sendChangeNotification(group, new_const);
            }
        }
    } else {
        // Save new document
        await new_const.save();
        logger.info('Constitution with the id ' + new_const.id + ' is new. ');
        for (let group of new_const.group) {
            // Send notification
            await sendNewNotification(group, new_const);
        }
    }
}

async function sendNewNotification(group, constitution) {
    // Get all users with given group
    const users = await User.find({
        group: group
    });

    // Create messaging instance
    const serviceAccount = require("./serviceAccountKey.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    const messaging = getMessaging();

    // Send message
    for (let user of users) {
        if (user.messagingToken) {
            const message = {
                "token":  user.messagingToken,
                "notification": {
                    "title": "Neue Vertretung in der Stunde/den Stunden " + constitution.hour,
                    "body": "Es gibt eine neue Vertretung für das Fach " + constitution.topic_old + "."
                }
            }
            await messaging.send(message).then((response) => {
                logger.log('Sent message: ' + response);
            });
        }
    }
}

async function sendChangeNotification(group, constitution) {
    // Get all users with given group
    const users = await User.find({
        group: group
    });

    // Create messaging instance
    const serviceAccount = require("./serviceAccountKey.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    const messaging = getMessaging();

    // Send message
    for (let user of users) {
        if (user.messagingToken) {
            const message = {
                "token":  user.messagingToken,
                "notification": {
                    "title": "Es gibt Änderungen an der Vertretung in der Stunde/den Stunden " + constitution.hour,
                    "body": "Es gibt eine neue Änderung an der Vertretung für das Fach " + constitution.topic_old + "."
                }
            }
            await messaging.send(message).then((response) => {
                logger.log('Sent message: ' + response);
            })
        }
    }
}