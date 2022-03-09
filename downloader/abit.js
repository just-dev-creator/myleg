const dsbmobile = require("dsbapi");
(async () =>  {
    // Initialize .env file
    require('dotenv').config();
    // Connect to dsbmobile "api"
    const dsb = new dsbmobile(process.env.DSBMOBILE_ID, process.env.DSBMOBILE_PASSWORD);
    // Get timetables from dsb
    const timetables = dsbmobile.findMethodInData('timetable', await dsb.fetch());
    console.log(timetables.data.filter((data) => {
        return data.title === 'Spots';
    }).length);
})();