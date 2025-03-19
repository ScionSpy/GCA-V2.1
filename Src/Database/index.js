/**
 * @typedef {"players"|"players"} TableCategory
*/


const Database = require('./core.js');
const DB = new Database();


const Validator = function (table, data, options, newData) {
    if (typeof table !== "string") {
        throw new Error(`'table' must be a string! got ${typeof table}`);
    }
    if (!Object.prototype.hasOwnProperty.call(TableCategory, table)) {
        throw new Error(`'${table}' is not a valid Database Category!`);
    };



    if (typeof data !== "object") {
        throw new Error(`'data' must be an object! got ${typeof data}`);
    };



    if (typeof newData !== "undefined" && typeof newData !== "object") {
        throw new Error(`'data' must be an object! got ${typeof newData}`);
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
    _Get = async function _Get(table, data, options){
        Validator(table, options);
        return await DB._Get(table, data, options.proj, options.opt);
    };


    /**
     * @param {TableCategory} table
     * @param {object} data
     */
    _Post = async function _Post(table, data) {
        Validator(table, options);
        return await DB._Post(table,data);
    };


    /**
     * @param {TableCategory} table
     * @param {object} data
     * @param {object} newData
     */
    _Edit = async function _Edit(table, data, newData) {
        Validator(table, options);
        return await DB._Edit(table, data, undefined, newData);
    };


    /**
     * @param {TableCategory} table
     * @param {object} data
     */
    _Delete = async function _Delete(table, data) {
        Validator(table, data);
        return await DB._Delete(table, data);
    };
};

module.exports = db;
