const https = require('https');
const config = require('../../../config.js');
const WEBHOOKS = config.LOGGER.WEBHOOKS;
const Logger = require('./logger.js');
const timestamp = require('../../Discord/Helpers/Utils.js').getTimeStamp;
let count = 0;



module.exports = class WebLogger extends Logger {

    #Embeds = {
        'console': [],
        'debug': [],
        'warning': [],
        'error': []
    };

    /** @type {String} */
    name;
    constructor(Name) {
        let name = `WebLogger #{COUNT}`;
        if (Name && typeof Name === "string") name = Name;
        else name = name.replace('{COUNT}', count++);

        super(name);
        this.name = name;
    };

    #sendMessage = async function(webhook, data){
        let promise = await new Promise(r => {
            let req = https.request(webhook, {
                headers: {
                    "Content-type": "application/json",
                    "Content-length": Buffer.byteLength(data)
                },
                method: "POST"
            }, r);
            req.write(data);
        });

        let statusCode = promise.statusCode ? promise.statsuCode : null;

        if (statusCode < 200 && statusCode > 299){
            let DATA = {
                status: promise.statusCode,
                message: promise.statusMessage,
            };
            this.error(`Webhook Failed!\n${JSON.stringify(DATA)}`);
        };

        return promise;
    };


    #formatMessage = async function (data = { type: 'console', msg, code: '', queueEmbed: false}){
        let { type, msg, code, queueEmbed } = data;
        if (!msg || !config.LOGGER.writeToWebhook) return;

        type = type.toLowerCase();
        let HOOK = WEBHOOKS['logger_' + type] ? WEBHOOKS['logger_' + type] : null;
        if (!HOOK) return;

        msg = `[${timestamp()}] (${type.toUpperCase()}) | ` + msg;
        msg = msg.replaceAll('@Shadow', '<@213250789823610880>');
        msg = msg.replaceAll('@TECH', '<@1236090488545869854>');

        let embedAuthor = { name: this.name };
        let embedData = {
            author: embedAuthor,
            description: msg,
            //timestamp: true
        };

        if (code){
            if (Object.prototype.toString.call(code) == '[object Object]') code = JSON.stringify(code).slice(0, 1010);
            else if (Object.prototype.toString.call(code) == '[object Array]') embedData.fields = [
                { name: "", value: '```js\n' + JSON.stringify(code).slice(0, 1010) + '```' }
            ];
            else embedData.fields = [
                { name: "", value: '```js\n' + code.slice(0, 1010) + '```' }
            ];
        };

        this.#Embeds[type].push(embedData);

        /*if (extra) {
            let Extra;

            if (typeof extra === 'object') Extra = `\`\`\`js\n${JSON.stringify(extra, null, 4)}\n\`\`\``
            else if (typeof extra !== 'string') Extra = extra.toString();

            embeds.push({
                description: Extra,
                //timestamp: true
            });
        };*/


        if (!queueEmbed) {
            let hookData = JSON.stringify({
                embeds: this.#Embeds[type]
            });

            this.#Embeds[type] = [];

            let promise = await this.#sendMessage(HOOK, hookData);
            if (!promise) {
                this.error(`Error calling WebHook!!`, promise);
                throw new Error(`Error calling WebHook!!\n> ${JSON.stringify(promise, null, 4)}`);
            };
        };
    };

    webConsole(content = "", code, opt = { endNewLine: false, queueEmbed: false }) {
        this.log(content, code, opt.endNewLine);
        this.#formatMessage({ type: 'console', msg: content, code, queueEmbed: opt.queueEmbed });
    };


    webDebug(content = "", code, opt = { endNewLine: false, queueEmbed: false }) {
        this.log(content, code, opt.endNewLine);
        this.#formatMessage({ type: 'debug', msg: content, code, queueEmbed: opt.queueEmbed });
    };

    webWarning(content = "", code, opt = { endNewLine: false, queueEmbed: false }) {
        this.warn(content, code, opt.endNewLine);
        this.#formatMessage({ type: 'warning', msg: content, code, queueEmbed: opt.queueEmbed });
    };

    webError(content = "", code = "", opt = { endNewLine: false, queueEmbed: false }) {
        this.error(content, code, opt.endNewLine);
        this.#formatMessage({ type: 'error', msg: content, code, queueEmbed: opt.queueEmbed });
    };
};
