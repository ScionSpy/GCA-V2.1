const https = require('https');
const urlParser = require('url-parse');
const config = require('./apiConfig');
const Logger = require('../Structures/Logger/logger');
const logger = new Logger("WebAPI");

function createRequest(options, res, rej){
    let Data;
    let request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk.toString();
        });

        response.on('end', () => {
            try {
                const body = JSON.parse(data);
                Data = body;

                if (config.DEBUG) logger.debug('', data);
                if (Data?.status == 'error') rej(Data);
                res(Data);
            } catch (err) {
                rej({ error: err.message, body: data });
            };
        });
    });

    request.on('error', (error) => {
        logger.error('', error);
        rej(error);
    });

    return request;
};

/**
 * Checks if a string contains a URL
 * @param {string} text
 */
function containsLink(text) {
    return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.test(
        text
    );
};

const httpMethods = [ 'GET', 'POST', 'PATCH' ];

module.exports = class WebApp {
    constructor(URI) {
        if (typeof URI !== "undefined" && (typeof URI !== "string" || !containsLink(URI))) throw new Error(`WebApp: URI must be a URL String! got ${typeof URI} : ${typeof URI !== "undefined" ? URI : undefined}`);
        this.URI = URI;
    };

    async #VerifyInfo(Data) {
        if (!this.URI && !containsLink(Data.URL)) throw new Error(`WebApp: URI must be a URL String! got ${typeof URI} : ${typeof URI !== "undefined" ? URI : undefined}`);
    };

    getOptions(Data) {
        if (typeof Data !== "object") throw new Error(`WebApp.getOptions(Data); 'Data' must be an object! got ${typeof Data} : ${Data}`);
        if (!Data.url || typeof Data.url !== "object") throw new Error(`WebApp.getOptions(Data); {Data.url} is required, and must be an object! got ${typeof Data.url} : ${Data.url}`);
        if (!Data.method || typeof Data.method !== "string") throw new Error(`WebApp.getOptions(Data); {Data.method} is required, and must be a string! got ${typeof Data.method} : ${Data.method}`);
        if (!httpMethods.includes(Data.method)) throw new Error(`WebApp.getOptions(Data); Invalid {Data.method}! got ${Data.method}! Must be one of ${httpMethods}`);

        return {
            host: Data.url.host,
            url: Data.url,
            path: Data.url.pathname + Data.url.query,
            method: Data.method,
            'User-Agent': 'GCA_ClientServer',
        };
    };

    async __makeRequest(URL, Cookies) {
        await this.#VerifyInfo({ URL });

        let _this = this;
        let url = new urlParser(URL)
        const options = this.getOptions({ url, method: "GET" });

        if (Cookies) options.headers = { Cookie: Cookies };

        let promise = new Promise(function (res, rej) {
            if (config.DEBUG) logger.debug(`WebAPI: Request: ${URL}`);

            const request = createRequest(options, res, rej);

            request.end()
        });

        return promise;
    };


    async __makePost(URL, Cookies, Data) {
        await this.#VerifyInfo({ URL });

        let _this = this;
        let url = new urlParser(URL)
        const options = this.getOptions({ url, method: "POST" });

        if (Cookies) options.headers = { Cookie: Cookies };

        let promise = new Promise(function (res, rej) {
            if (config.DEBUG) logger.debug(`WebAPI: Request: ${URL}`);

            const request = createRequest(options, res, rej);

            request.write(Data);
            request.end()
        });

        return promise;
    };


    async __makePatch(URL, Cookies, Data) {
        await this.#VerifyInfo({ URL });

        let _this = this;
        let url = new urlParser(URL)
        const options = this.getOptions({ url, method: "PATCH" });

        if (Cookies) options.headers = { Cookie: Cookies };

        let promise = new Promise(function (res, rej) {
            if (config.DEBUG) logger.debug(`WebAPI: Request: ${URL}`);

            const request = createRequest(options, res, rej);

            request.write(Data);
            request.end()
        });

        return promise;
    };
};
