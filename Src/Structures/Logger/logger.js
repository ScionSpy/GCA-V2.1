const timestamp = require('../../Discord/Helpers/Utils').getTimeStamp;
const config = require('../../../config');
const fs = require('fs');
let count = 0;

/**
 * Default color map.
 */

/*exports.colors = {
    pass: 90,
    fail: 31,
    'bright pass': 92,
    'bright fail': 91,
    'bright yellow': 93,
    pending: 36,
    suite: 0,
    'error title': 0,
    'error message': 31,
    'error stack': 90,
    checkmark: 32,
    fast: 90,
    medium: 33,
    slow: 31,
    green: 32,
    light: 90,
    'diff gutter': 90,
    'diff added': 32,
    'diff removed': 31
};*/



/**
 * Default symbol map.
 */

/*exports.symbols = {
    ok: '✓',
    err: '✖',
    dot: '․',
    comma: ',',
    bang: '!'
};
*/

let logs = [];

const AcceptedLogTypes = [
    "unsigned", "log", "debug", "warn", "error", // defaults
    "setting_changes" // Any modifications from the "settings" command.
];

module.exports = class Logger {
    name = `Logger #{COUNT}`;
    constructor(name) {
        if (name && typeof name === "string") this.name = name;
        else this.name = this.name.replace('{COUNT}', count++);
    };

    async #createStream(file) {
        if (!file) return false;
        let stream;
        if (!logs[file]) {
            let Path = `./Logs/${file.toLowerCase()}.txt`;

            stream = await fs.createWriteStream(Path, {
                //flags = 'a' means appending (old data will be preserved)
                //  The file is created if it does not exist.
                flags: 'a'
            });

            logs[file] = stream;
        } else {
            stream = logs[file];
        };

        return stream;
    };

    /**
     *
     * @param {Object} data
     * @param {String} data.title
     * @param {String} data.content
     * @returns
     */
    async writeToFile(data = {content:"", title: "unsigned"}){
        if (!config.LOGGER.writeToFile || !data) return false;
        let { type, msg, code } = data;

        if (typeof data !== "object") throw new Error(`Logger.writeToFile(data); 'data' must be of type 'Object', got : ${typeof data}`);
        if (!data.content || typeof data.content !== "string") throw new Error(`Logger.writeToFile(data {content, title}); 'data.content' must exist and be of type 'string', got : type: ${typeof data.content} = ${data.content}`);
        if (typeof data.title !== "string") throw new Error(`Logger.writeToFile(data {content, title}); 'data.title' must be of type 'string', got : type: ${typeof data.title} = ${data.title}`);
        if (!AcceptedLogTypes.includes(data.title)) throw new Error(`Logger.writeToFile(data {content, title});\n• 'data.title' must be one of the following [ ${AcceptedLogTypes.join(', ')} ]; got ${data.title}\n`);


        let stream = await this.#createStream(data.title);

        let time = `${timestamp()} (${data.title.toUpperCase()}) | `;
        await stream.write(time + data.content+'\n\r\n');
        if (data.title !== "log") {
            stream = await this.#createStream('log');
            await stream.write(time + data.content + '\n\n');
        };
        return true;
    };


    /**
     * @param {String} content
     * @param {Object} code
     * @param {Boolean} endNewLine
     */
    hiddenLog(content = "", code, logFileName = "log") {
        let txt = `${content}`;
        if (code) txt += `\n${JSON.stringify(code, null, 4)}`;
        this.writeToFile({ title: logFileName, content: txt });
    };


    /**
     * @param {String} content
     * @param {Object} code
     * @param {Boolean} endNewLine
     */
    log(content = "", code, endNewLine = false) {
        if (!code) console.log(`\u001b[32mINFO\u001b[0m ${timestamp()} [${this.name}] ${content}`);
        else {
            console.log(`\u001b[32mINFO\u001b[0m ${timestamp()} [${this.name}] ${content}\n`);
            console.log(code);
            if (endNewLine) console.log();
        };

        this.hiddenLog(content, code);
    };


    /**
     * @param {String} content
     * @param {Object} code
     * @param {Boolean} endNewLine
     */
    logSettings(content = "", code, endNewLine = false) {
        if (config.LOGGER.announceDebugs) {
            if (!code) console.log(`\u001b[32mINFO\u001b[0m ${timestamp()} [${this.name}] ${content}`);
            else {
                console.log(`\u001b[32mINFO\u001b[0m ${timestamp()} [${this.name}] ${content}\n`);
                console.log(code);
                if (endNewLine) console.log();
            };
        };

        this.hiddenLog(content, code, "setting_changes");
    };

    /**
     * @param {String} content
     * @param {Object} code
     * @param {Boolean} endNewLine
     */
    debug(content = "", code, endNewLine = false) {
        if (!config.LOGGER.debug) return;
        if (config.LOGGER.announceDebugs) {
            if (!code) console.log(`\u001b[90mDEBUG\u001b[0m ${timestamp()} [${this.name}] ${content}`);
            else {
                console.log(`\u001b[90mDEBUG\u001b[0m ${timestamp()} [${this.name}] ${content}\n`);
                console.log(code);
                if (endNewLine) console.log();
            };
        };

        let txt = `${content}`;
        if (code) txt += `\n${JSON.stringify(code, null, 4)}`;
        this.writeToFile({ title:"debug", content: txt });
    };

    /**
     * @param {String} content
     */
    warn(content) {
        console.log(`\u001b[33mWARN\u001b[0m ${timestamp()} [${this.name}] ${content}\n`);

        this.writeToFile({ title:"warn", content });
    };

    /**
     * @param {String} content
     * @param {Object} error
     * @param {Boolean} endNewLine
     */
    error(content, error, endNewLine = false) {
        if (!error) console.error(`\u001b[31mERROR\u001b[0m ${timestamp()} [${this.name}] ${content}`);
        else {
            console.error(`\u001b[31mERROR\u001b[0m ${timestamp()} [${this.name}] ${content}\n>  ${error}\n`);
            if (endNewLine) console.log();
        };

        let txt = `${content}`;
        if (error) txt += `\n${JSON.stringify(error, null, 4)}`;
        this.writeToFile({ title:"error", content:txt });
    };
};
