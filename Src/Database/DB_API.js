/**
 * @typedef {"guildsettings"|"players"|"rewardcodes"} TableCategory
*/

const AcceptedMethods = [ 'GET', 'POST', 'EDIT', 'DELETE' ];
const TableCategory = [
    "GuildSettings",
    "Players",
    "RewardCodes"
]


const Database = require('./core.js');
const DB = new Database();


const Validator = function (Method, table, data, options, newData) {
    if (typeof Method !== "string") {
        throw new Error(`'Method' must be a string! got ${typeof Method}`);
    };
    if (!AcceptedMethods.includes(Method)) {
        throw new Error(`'${Method}' is not a valid Method! Use one of : ${AcceptedMethods}`);
    };


    if (typeof table !== "string") {
        throw new Error(`'table' must be a string! got ${typeof table}`);
    };
    if (!TableCategory.includes(table)) {
        throw new Error(`'${table}' is not a valid Database Category!`);
    };



    if (Method !== "GET" && typeof data !== "object") {
        throw new Error(`'data' must be an object! got ${typeof data}`);
    };



    if (Method === "EDIT" && typeof newData !== "object") {
        throw new Error(`'newData' must be an object! got ${typeof newData}`);
    };



    if (typeof options !== "undefined" && typeof options !== "object") {
        throw new Error(`'options' must be an opject or undefined. got ${typeof options}`);
    };
    if (options) {
        if (options.project && typeof options.project !== "object") {
            throw new Error(`'options.project' must be an object! got ${typeof Object.project}`);
        };
    };
};


class db {
    constructor(){};

    /**
     * @param {TableCategory} table
     * @param {object} data
     * @param {object} [options]
     */
    _Get = async function _Get(table, data, options = {}){
        Validator("GET", table, data, options);
        return await DB._Get(table, data, options.proj, options.opt);
    };


    /**
     * @param {TableCategory} table
     * @param {object} data
     */
    _Post = async function _Post(table, data) {
        Validator("POST", table, data);
        return await DB._Post(table, data);
    };


    /**
     * @param {TableCategory} table
     * @param {object} data
     * @param {object} newData
     */
    _Edit = async function _Edit(table, data, newData) {
        Validator("EDIT", table, data, undefined, newData);
        return await DB._Edit(table, data, newData);
    };


    /**
     * @param {TableCategory} table
     * @param {object} data
     */
    _Delete = async function _Delete(table, data) {
        Validator("DELETE", table, data);
        return await DB._Delete(table, data);
    };
};

module.exports = db;
