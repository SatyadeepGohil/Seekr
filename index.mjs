class Seekr {
    constructor(data) {
        this.originalData = data;
        this.dataType = this._detectDataType(data);
    }

    _detectDataType (data) {
        if (Array.isArray(data)) return 'array';
        if (data instanceof Map) return 'map';
        if (data instanceof Set) return 'set';
        if (typeof data === 'string') return 'string';
        if (data && typeof data === 'object') return 'object';
        return 'primitive';
    }

    search (query, property, options = {}) {
        const {mode = 'exact', caseSensitive = false, deep = false } = options;

        switch(this.dataType) {
            case 'array':
                return this._searchArray(query, property, options);
            case 'object':
                return this._searchObject(query, property, options);
            case 'string':
                return this._searchString(query, options);
            case 'map':
                return this._searchMap(query, property, options);
            case 'set':
                return this._searchSet(query, options);
            default:
                throw new Error(`Unsupported data type: ${this.dataType}`);
        }
    }

    _searchArray (query, property, options) {
        const {mode, caseSensitive, deep} = options;

        return this.originalData.filter(item => {
            if (property) {
                return this._compareProperty(item, property, query, {mode, caseSensitive, deep});
            } else {
                return this._compareValue(item, query, {mode, caseSensitive});
            }
        });
    }

    _searchObject (query, property, options) {
        const { mode, caseSensitive, deep} = options;
        const results = [];

        if (property) {
            // Search specific property
            if (this._compareProperty(this.originalData,property, query, options)) {
                results.push(this.originalData);
            }
        } else {
            // search all properties
            for (const [key, value] of Object.entries(this.originalData)) {
                if (this._compareValue(value, query, options)) {
                    results.push({key, value});
                }
            }
        }
        return results;
    }

    _searchString (query, options) {
        const {mode, caseSensitive} = options;
        const searchString = caseSensitive ? this.originalData : this.originalData.toLowerCase();
        const searchQuery = caseSensitive ? query : query.toLowerCase();

        switch(mode) {
            case 'exact':
                return searchString === searchQuery ? [this.originalData] : [];
            case 'subString':
                return searchString.includes(searchQuery) ? [this.originalData] : [];
            case 'regex':
                const regex = new RegExp(query, caseSensitive ? 'g' : 'gi');
                const matches = searchString.match(regex);
                return matches || [];
            default:
                throw new Error(`Unsupported search mode: ${mode}`);
        }
    }

    _compareProperty(item, property, query, options) {
        const { deep } = options;

        if (deep && property.includes('.')) {
            const value = this._getNestedValue(item, property);
            return this._compareValue(value, query, options);
        } else {
            return this._compareValue(item[property], query, options);
        }
    }

    _compareValue(value, query, options) {
        const { mode, caseSensitive } = options;

        if (value === null || value === undefined) return false;

        switch(mode) {
            case 'exact':
                if (typeof value === 'string' && typeof query === 'string') {
                    return caseSensitive ? value === query : value.toLowerCase() === query.toLowerCase();
                }
                return value === query;

            case 'subString':
                if (typeof value !== 'string') return false;
                const searchValue = caseSensitive ? value : value.toLowerCase();
                const searchQuery = caseSensitive ? query : query.toLowerCase();
                return searchValue.includes(searchQuery);
            
            case 'range':
                // for numbers and dates
                if (typeof value === 'number' && Array.isArray(query)) {
                    return value >= query[0] && value <= query[1];
                }
                return false;
            default:
                return false;
        }
    }

    _getNestedValue (obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        })
    }

    _searchMap (query, property, options) {
        throw new Error('Map Searching not yet implemented');
    }

    _searchSet (query, options) {
        throw new Error('Set searching not yet implemented')
    }
}

export default Seekr;