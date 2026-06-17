

function myStringify(value, space) {
    let indentStr = null;

    if (typeof (space) === 'number')
        indentStr = ' '.repeat(Math.min(space, 10));
    if (typeof (space) === 'string')
        space.length <= 10 ? indentStr = space : indentStr = space.slice(0, 10);

    const usedObjects = new WeakSet();

    function stringifyRecursive(value, indentLevel) {

        let currentIndent = '';
        let parentIndent = '';

        if (indentStr) {
            currentIndent = '\n' + indentStr.repeat(indentLevel + 1);
            parentIndent = '\n' + indentStr.repeat(indentLevel);
        }

        if (value === null)
            return 'null';

        let valueType = typeof (value);

        if (valueType !== 'object') {
            if (valueType === 'bigint')
                throw new TypeError("Cant use bigInt");
            if (valueType === 'undefined' || valueType === 'symbol' || valueType === 'function')
                return;
            if (valueType === 'string')
                return `"${value}"`;
            return String(value);
        }

        if (usedObjects.has(value))
            throw new TypeError("Self link object");

        usedObjects.add(value);

        if (typeof value.toJSON === 'function')
            return stringifyRecursive(value.toJSON(), indentLevel);

        let accurateType = Object.prototype.toString.call(value);

        if (accurateType === '[object RegExp]' || accurateType === '[object Map]' || accurateType === '[object Set]')
            return '{}';

        if (accurateType === '[object Number]' || accurateType === '[object Boolean]')
            return String(value);

        if (accurateType === '[object String]')
            return '"' + String(value) + '"';

        if (Array.isArray(value)) {
            let result = '[';
            let array = [];
            for (let item of value) {
                if (typeof (item) === 'undefined') {
                    array.push('null');
                    continue;
                }

                let nestedResult = stringifyRecursive(item, indentLevel + 1);
                array.push(nestedResult);
            }

            if (array.length === 0) return '[]';

            result += currentIndent + array.join(',' + currentIndent) + parentIndent + ']';
            return result;
        }

        let result = '{';
        let objectsEntries = [];

        for (let key in value) {
            let fieldType = typeof (value[key]);

            if (fieldType === 'function' || fieldType === 'symbol' || fieldType === 'undefined')
                continue;

            let nestedResult = stringifyRecursive(value[key], indentLevel + 1);

            let separator = indentStr ? ': ' : ':';
            objectsEntries.push('"' + key + '"' + separator + nestedResult);
        }

        if (objectsEntries.length === 0) return '{}';

        result += currentIndent + objectsEntries.join(',' + currentIndent) + parentIndent + '}';
        return result;
    }

    return stringifyRecursive(value, 0);
}

module.exports = { myStringify };
