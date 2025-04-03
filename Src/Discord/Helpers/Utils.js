const { readdirSync, lstatSync } = require("fs");
const { join, extname } = require("path");

module.exports = class Utils {

    /**
     * Checks if a string contains a URL
     * @param {string} text
     */
    static containsLink(text) {
        return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.test(
            text
        );
    };


    /**
     * Checks if a string is a valid discord invite
     * @param {string} text
     */
    static containsDiscordInvite(text) {
        return /(https?:\/\/)?(www.)?(discord.(gg|io|me|li|link|plus)|discorda?p?p?.com\/invite|invite.gg|dsc.gg|urlcord.cf)\/[^\s/]+?(?=\b)/.test(
            text
        );
    };

    /**
     * Returns a random number below a max
     * @param {number} max
     */
    static getRandomInt(max, min = 1) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    static roundToNthNumber(value, roundTo) {
        return Number(value.toFixed(roundTo));
    };





    /**
     * Recursively searches for a file in a directory
     * @param {string} dir
     * @param {string[]} allowedExtensions
     */
    static recursiveReadDirSync(dir, allowedExtensions = [".js"]) {
        const filePaths = [];
        const readCommands = (dir) => {
            const files = readdirSync(join(process.cwd(), dir));
            files.forEach((file) => {
                const stat = lstatSync(join(process.cwd(), dir, file));
                if (stat.isDirectory()) {
                    readCommands(join(dir, file));
                } else {
                    const extension = extname(file);
                    if (!allowedExtensions.includes(extension)) return;
                    const filePath = join(process.cwd(), dir, file);
                    filePaths.push(filePath);
                }
            });
        };
        readCommands(dir);
        return filePaths;
    };








    /**
     * @param {Object} options
     * @param {Date} options.Date
     * @param {Boolean} options.UTC Set timestamp as UTC.
     */
    static getTimeStamp(options = { Date: new Date(), UTC: false }) {
        if (options.UTC && typeof options.UTC !== "boolean") throw new Error(`Utils.getTimeStamp(options = {Date, UTC}); {options.UTC} if provided Must be a Boolean! got ${typeof options.UTC} : ${options.UTC}`);

        /**
         *
         * @param {Number} value
         */
        function getLength(value) {
            return value.toString().length;
        };

        let date = options.Date// ? options.Date : new Date();
        if (!date) date = new Date();

        let Year;
        let Month;
        let Day;
        let Hour;
        let Minute;
        let Second;
        let mSeconds;

        if (!options.UTC) {
            Year = date.getFullYear();
            Month = date.getMonth() + 1;
            Day = date.getDate();
            Hour = date.getHours();
            Minute = date.getMinutes();
            Second = date.getSeconds();
            mSeconds = date.getMilliseconds();

        } else {
            Year = date.getUTCFullYear();
            Month = date.getUTCMonth() + 1;
            Day = date.getUTCDate();
            Hour = date.getUTCHours();
            Minute = date.getUTCMinutes();
            Second = date.getUTCSeconds();
            mSeconds = date.getUTCMilliseconds();
        };


        if (getLength(Month) == 1) Month = `0${Month}`;
        if (getLength(Day) == 1) Day = `0${Day}`;
        if (getLength(Hour) == 1) Hour = `0${Hour}`;
        if (getLength(Minute) == 1) Minute = `0${Minute}`;
        if (getLength(Second) == 1) Second = `0${Second}`;
        if (getLength(mSeconds) == 1) mSeconds = `00${mSeconds}`;
        if (getLength(mSeconds) == 2) mSeconds = `0${mSeconds}`;
        return `${Year}-${Month}-${Day} ${Hour}:${Minute}:${Second}.${mSeconds} ${options.UTC ? 'UTC' : 'EST'}`;
    };


    /**
     *
     * @param {Array<String>} array Array to clean.
     * @param {String} input What to buffer with. (Default: ' ')
     * @returns Array<Strings>
     */
    async prettyLists(array, input = ' ') {
        let cleanArray = [];
        let longest = 0;
        for (let x = 0; x < array.length; x++) {
            if (array[x].length > longest) longest = array.length;
        };

        for (let x = 0; x < array.length; x++) {
            let item = array[x].key;
            if (item.length < longest) item = await item.padStart(longest, input);
            cleanArray.push(item);
        };

        return cleanArray;
    };





    /**
     * Returns hour difference between two dates
     * @param {Date} dt2
     * @param {Date} dt1
     */
    static diffHours(dt2, dt1) {
        let diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60 * 60;
        return Math.abs(Math.round(diff));
    }

    /**
     * Returns remaining time in days, hours, minutes and seconds
     * @param {number} timeInSeconds
     */
    static timeformat(timeInSeconds) {
        const days = Math.floor((timeInSeconds % 31536000) / 86400);
        const hours = Math.floor((timeInSeconds % 86400) / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.round(timeInSeconds % 60);
        return (
            (days > 0 ? `${days} days, ` : "") +
            (hours > 0 ? `${hours} hours, ` : "") +
            (minutes > 0 ? `${minutes} minutes, ` : "") +
            (seconds > 0 ? `${seconds} seconds` : "")
        );
    }

    /**
     * Converts duration to milliseconds
     * @param {string} duration
     */
    static durationToMillis(duration) {
        return (
            duration
                .split(":")
                .map(Number)
                .reduce((acc, curr) => curr + acc * 60) * 1000
        );
    }

    /**
     * Returns time remaining until provided date
     * @param {Date} timeUntil
     */
    static getRemainingTime(timeUntil) {
        const seconds = Math.abs((timeUntil - new Date()) / 1000);
        const time = Utils.timeformat(seconds);
        return time;
    }






    /**
     * @param {import("discord.js").PermissionResolvable[]} perms
     */
    static parsePermissions(perms) {
        const permissionWord = `permission${perms.length > 1 ? "s" : ""}`;
        return "`" + perms.map((perm) => permissions[perm]).join(", ") + "` " + permissionWord;
    }


    /**
     * Splits messages every 1990 characters ensuring message can pass through the Discord MessageCreate function.
     * • Leaves room for a codeblock, and code formatting.
     * @param {String} string string to split.
     * @returns {String[]}
     */
    static messageSplitter(string) {
        function splitString(string) {
            const result = [];
            for (let x = 0; x < string.length; x += 1990) {
                result.push(string.substring(x, x + 1990))
            };
            return result;
        };

        return splitString(string);
    };
};
