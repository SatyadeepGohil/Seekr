const dataTypeNames = {
    undefined: 'undefined',
    null: 'null',
    string: 'string',
    boolean: 'boolean',
    number: 'number',
    array: 'array',
    object: 'object',
    symbol: 'symbol',
    function: 'function',
    bigint: 'bigint',
    map: 'map',
    set: 'set'
};

class Seekr {
    constructor (data){
        this.originalData = data;
        this.dataType = this.typeDetection(data);
    }

    typeDetection (uncheckData) {
        // undefined and null foremost because to not operate unnecessary operations, a performance optimization.
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

    search (query, property, options = {}) {

        if (query === '' || query === null || query === undefined) return [];

        switch (this.dataType) {

            case dataTypeNames.null:
                throw new Error(`
                    Seekr search method terminated.
                    Received data type: null
                    Error: Search data inputed as Seekr argument is a null, So it's not searchable.
                    Solution: Don't provide null as searching data.
                    `);

            case dataTypeNames.undefined:
                throw new Error(`
                    Seekr search method terminated.
                    Received data type: undefined
                    Error: Search data inputed as Seekr argument is undefined, So it's not searchable.
                    Solution: Provide a JavaScript valid data type.
                    `);

            case dataTypeNames.array:
                return this.searchArray(query, property, options);

            default:
                throw new Error(`Unsupported data type: ${this.dataType}`);
        }
    }

    searchArray (query, property, options) {
        const {mode, caseSensitive, deep} = options;

        return this.originalData.filter(item => {
            if (property) {
                return this.compareProperty(item, property, query, {mode, caseSensitive, deep})
            } else {
                return this.compareValue(item, query, {mode, caseSensitive});
            }
        });
    }

    compareProperty (item, property, query, options) {
        const {deep} = options;

        if (deep && property.includes('.')) {
            const value = this.getNestedValue(item, property);
            return this.compareValue(value, query, options);
        } else {
            return this.compareValue(item[property], query, options);
        }
    }

    compareValue (value, query, options) {
        const {mode, caseSensitive} = options;

        if (value === null || value === undefined) return false;

        switch(mode) {
            case 'exact':
                if (typeof value === dataTypeNames.string && typeof query === dataTypeNames.string) {
                    return caseSensitive ? value === query : value.toLowerCase() === query.toLowerCase();
                }
                return value === query;

            default:
                return false;
        }
    }

    getNestedValue (obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        })
    }
}