/**
 * @typedef {Object} SearchOptions - Configuration options for different search modes.
 * @property {'exact'} [mode] - Search mode, 'exact' performs identical matching against the data.
 * @property {boolean} [caseSensitive=false] - Enable case-sensitive matching.
 * @property {boolean} [deep=false] - Enable deep nested property matching. This is a costly operation.
 */

/**
 * A lightweight, flexible search utility for JavaScript data structures.
 * @class
 */

class Seekr {
    /**
     * Creates a new instance of Seekr.
     * @constructor
     * @param {*} data - Any valid JavaScript data type to be used as searchable source.
     */
    constructor (data){
        this.originalData = data;
        this.dataType = this.typeDetection(data);
    }

    /**
     * Detects the type of input data.
     * @param {*} uncheckData - The data whose type needs to be determined.
     * @returns {string} - A string representing the type of the input data.
     */
    typeDetection (uncheckData) {
        // undefined and null foremost because not to operate unnecessary operations, a early performance optimization as fast fail strategy.
        if (typeof uncheckData === 'undefined') return 'undefined';
        if (null === uncheckData) return 'null';
        if (typeof uncheckData === 'string') return 'string';
        if (typeof uncheckData === 'boolean') return 'boolean';
        if (typeof uncheckData === 'number') return 'number';
        if (Array.isArray(uncheckData)) return 'array';
        if (uncheckData instanceof Map) return 'map';
        if (uncheckData instanceof Set) return 'set';
        if (typeof uncheckData === 'object') return 'object';
        if (typeof uncheckData === 'symbol') return 'symbol';
        if (typeof uncheckData === 'function') return 'function';
        if (typeof uncheckData === 'bigint') return 'bigint';
    }

    /**
     * Searches through the data using specified criteria and delegates search responsibilities to specific methods according to type of given data.
     * @param {*} query - The value to search for. Most modes expect a string, but primitives are allowed. 
     * @param {string | null} [property] - Provide name to search within objects. Pass null to search values directly.
     * @param {SearchOptions} [options] - Search options, choose one or default is exact.
     * @returns {*} - Filtered data containing matching items or a item based on query, property and options.
     * @throws {Error} When data type is null, undefined, or unsupported.
     */
    search (query, property, options = {}) {
        const {mode} = options;

        if (query === '') return [];
        if (mode === '') options.mode = 'exact';

        switch (this.dataType) {

            case 'null':
                throw new Error(`
                    Seekr search method terminated.
                    Received data type: null
                    Error: Search data inputed as Seekr argument is a null, So it's not searchable.
                    Solution: Don't provide null as searching data.
                    `);

            case 'undefined':
                throw new Error(`
                    Seekr search method terminated.
                    Received data type: undefined
                    Error: Search data inputed as Seekr argument is undefined, So it's not searchable.
                    Solution: Provide a JavaScript valid data type.
                    `);

            case 'array':
                return this.searchArray(query, property, options);
            case dataTypeNames.object:
                return this.searchObject(query, property, options);

            default:
                throw new Error(`Unsupported data type: ${this.dataType}`);
        }
    }

    /**
     * 
     * @param {*} query - Query is matched against the given array.
     * @param {string | null} property - Provide a name to search within array. Pass null to search values directly.
     * @param {SearchOptions} [options] - Search options that will affect the outcome.
     * @returns {Array} - Array of matching items.
     */
    searchArray (query, property, options) {
        const {mode, caseSensitive, deep} = options;

        return this.originalData.filter(item => {
            if (property !== null) {
                return this.compareProperty(item, property, query, {mode, caseSensitive, deep})
            } else {
                return this.compareValue(item, query, {mode, caseSensitive});
            }
        });
    }

    searchObject (query, property, options) {
        const results = [];

        if (property !== null) {
            //search specific property
            if (this.compareProperty(this.originalData, property, query, options)) {
                results.push(this.originalData);
            } else {
                // search all properties
                for (const [key, value] of Object.entries(this.originalData)) {
                    if (this.compareValue(value, query, options)) {
                        results.push([key, value]);
                    }
                }
            }
        }
        return results;
    }

    /**
     * A property comparison method that returns booleans when match is found, with deep object traversal functionality.
     * @param {*} item - Provide items for proper comparison. it's required for property comparison.
     * @param {string} property - Property name used for comparison. Required when deep option is enabled.
     * @param {*} query - Give Query to be compare against given data.
     * @param {SearchOptions} [options] 
     * @returns {boolean} - Returns true when property matches, otherwise false.
     */
    compareProperty (item, property, query, options) {
        const {deep} = options;

        if (deep && property.includes('.')) {
            const value = this.getNestedValue(item, property);
            return this.compareValue(value, query, options);
        } else {
            return this.compareValue(item[property], query, options);
        }
    }

    /**
     * A value comparison method.
     * @param {*} value - Value for comparison against query.
     * @param {*} query - Query for comparison against value.
     * @param {SearchOptions} [options] 
     * @returns {boolean} - Returns true for matches, false otherwise. Unsupported modes return false. Null and undefined return false.
     */
    compareValue (value, query, options) {
        const {mode, caseSensitive} = options;

        if (value === null || value === undefined) return false;

        switch(mode) {
            case 'exact':
                if (typeof value === 'string' && typeof query === 'string') {
                    return caseSensitive ? value === query : value.toLowerCase() === query.toLowerCase();
                }
                return value === query;

            default:
                return false;
        }
    }

    /**
     * Traverses nested object path to return value.
     * @param {object} obj - Object to traverse.
     * @param {string} path - Dot-notation path to traverse (e.g., 'user.profile.name').
     * @returns {*} - Returns the nested value or undefined if path doesn't exist.
     */
    getNestedValue (obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj)
    }
}