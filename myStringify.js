function myStringify(value, space) {
    let indentStr = null;

    if (typeof (space) === 'number')
        indentStr = ' '.repeat(Math.min(space, 10));
    if (typeof (space) === 'string')
        space.length <= 10 ? indentStr = space : indentStr = space.slice(0, 10);

    const usedObjects = new WeakSet();

    function escapeString(str) {
        return str
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/[\b]/g, '\\b')    // <-- ИСПРАВЛЕНО: [\b] вместо \b
            .replace(/\f/g, '\\f')
            .replace(/[\u0000-\u001F]/g, char => {
                return '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0');
            });
    }

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
                return `"${escapeString(value)}"`;
            if (valueType === 'number') {
                if (Number.isFinite(value)) return String(value);
                return 'null';
            }
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
            return '"' + escapeString(String(value)) + '"';

        if (Array.isArray(value)) {
            let result = '[';
            let array = [];
            for (let item of value) {
                let nestedResult = stringifyRecursive(item, indentLevel + 1);
                if (nestedResult === undefined) {
                    array.push('null');
                } else {
                    array.push(nestedResult);
                }
            }

            if (array.length === 0) return '[]';

            result += currentIndent + array.join(',' + currentIndent) + parentIndent + ']';
            return result;
        }

        let result = '{';
        let objectsEntries = [];

        for (const key of Object.keys(value)) {
            let fieldType = typeof (value[key]);

            if (fieldType === 'function' || fieldType === 'symbol' || fieldType === 'undefined')
                continue;

            let nestedResult = stringifyRecursive(value[key], indentLevel + 1);
            if (nestedResult === undefined) continue;

            let separator = indentStr ? ': ' : ':';
            objectsEntries.push('"' + escapeString(key) + '"' + separator + nestedResult);
        }

        if (objectsEntries.length === 0) return '{}';

        result += currentIndent + objectsEntries.join(',' + currentIndent) + parentIndent + '}';
        return result;
    }

    return stringifyRecursive(value, 0);
}

module.exports = { myStringify };

