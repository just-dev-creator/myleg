const dsbmobile = require("dsbapi");
const mongoose = require('mongoose');
const Abit = require('./abit_model');
const { createWorker } = require('tesseract.js');
const {mongo} = require("mongoose");
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

    const worker = createWorker({
        logger: m => undefined,
    });
    await worker.load();
    await worker.loadLanguage('deu')
    await worker.initialize('deu');
    const { data: { text }} = await worker.recognize(url.url);
    await worker.terminate();


    let groups = [];
    text.match(/([5-9])|(1[0-3])( |,|\n|\0)/g).forEach((group) => {
        groups.push(group.replace(',', '').replace('\n', ''));
        return;
    });
    const date_str = text.match(/[0-9]{1,2}\.[0-9]{1,2}\.2022/)[0];
    const dateParts = date_str.split('.');
    let date = new Date(+dateParts[2], dateParts[1] -1, +dateParts[0]);
    date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    console.log(date);
    console.log(groups);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

    const document = new Abit({
        date: date,
        groups: groups
    });
    // Store abit
    try {
        await document.save();
    } catch (e) {
        const existing = await Abit.findOne({
            date: date
        });
        existing.groups = groups;
        await existing.save();
    }

    await mongoose.disconnect();
})();