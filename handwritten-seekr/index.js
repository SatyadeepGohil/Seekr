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
    unknown: 'unknown',
};

class Seekr {
    constructor (data){
        this.originalData = data;
        this.dataType = this.typeDetection(data);

        this.validateInput();
    }

    typeDetection (uncheckData) {
        // undefined is first because to not operate unnecessary operations, a performance optimization.
        if (typeof uncheckData === 'undefined') return 'undefined';
        if (null === uncheckData) return 'null';
        if (typeof uncheckData === 'string') return 'string';
        if (typeof uncheckData === 'boolean') return 'boolean';
        if (typeof uncheckData === 'number') return 'number';
        if (Array.isArray(uncheckData)) return 'array';
        if (typeof uncheckData === 'object') return 'object';
        if (typeof uncheckData === 'symbol') return 'symbol';
        if (typeof uncheckData === 'function') return 'function';
        if (typeof uncheckData === 'bigint') return 'bigint';
        return 'unknown';
    }

    
    validateInput () {
        if (this.dataType === dataTypeNames.undefined) {
            throw new Error(`
                Seekr Initialization Failed.
                Received DataType: undefined
                Error: undefined is not searchable.
                Solution: Provide a JavaScript valid data type.
                `);
            }
            
            if (this.dataType === dataTypeNames.unknown) {
                throw new Error(`
                    Seekr terminated execution.
                    Received DataType: unknown
                    Error: unknown is not a valid JavaScript data type.
                    Solution: Provide a JavaScript valid data type.
                    `)
                }
    }

    get type() {
        return this.dataType;
    }
}