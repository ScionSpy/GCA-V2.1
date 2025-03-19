require('dotenv').config();

// register extenders
require("./Discord/Helpers/Extenders/Message");
require("./Discord/Helpers/Extenders/Guild");
require("./Discord/Helpers/Extenders/GuildChannel");


const BotClient = require('./Discord/Structures/BotClient');


// initialize client
const client = new BotClient();
client.loadAndLogin();


// find unhandled promise rejections
process.on("unhandledRejection", (err) => client.logger.webError(`Unhandled exception`, err.stack));

