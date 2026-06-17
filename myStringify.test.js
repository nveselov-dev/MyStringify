const { myStringify } = require('./myStringify');

describe('myStringify', () => {
    describe('Примитивы', () => {
        test('null должен вернуть "null"', () => {
            expect(myStringify(null)).toBe('null');
        });

        test('undefined должен вернуть undefined', () => {
            expect(myStringify(undefined)).toBeUndefined();
        });

        test('строка должна быть в кавычках', () => {
            expect(myStringify("hello")).toBe('"hello"');
        });

        test('число должно быть строкой без кавычек', () => {
            expect(myStringify(42)).toBe('42');
        });

        test('булево true должно быть "true"', () => {
            expect(myStringify(true)).toBe('true');
        });

        test('BigInt должен выбросить TypeError', () => {
            expect(() => myStringify(123n)).toThrow(TypeError);
        });
    });

    describe('Массивы', () => {
        test('простой массив', () => {
            expect(myStringify([1, "hello", true])).toBe('[1,"hello",true]');
        });

        test('undefined в массиве превращается в null', () => {
            expect(myStringify([1, undefined, 3])).toBe('[1,null,3]');
        });

        test('вложенные массивы', () => {
            expect(myStringify([[1, 2], [3, 4]])).toBe('[[1,2],[3,4]]');
        });
    });

    describe('Объекты', () => {
        test('простой объект', () => {
            expect(myStringify({ name: "Alex", age: 25 })).toBe('{"name":"Alex","age":25}');
        });

        test('вложенный объект', () => {
            expect(myStringify({ a: { b: 2 } })).toBe('{"a":{"b":2}}');
        });

        test('пропускает function и undefined', () => {
            expect(myStringify({ a: 1, b: () => {}, c: undefined })).toBe('{"a":1}');
        });
    });

    describe('Циклические ссылки', () => {
        test('должен выбросить TypeError', () => {
            const obj = {};
            obj.self = obj;
            expect(() => myStringify(obj)).toThrow(TypeError);
        });
    });

    describe('Специальные объекты', () => {
        test('Date возвращает строку', () => {
            const date = new Date('2023-01-01T00:00:00.000Z');
            expect(myStringify(date)).toBe('"2023-01-01T00:00:00.000Z"');
        });

        test('RegExp возвращает пустой объект', () => {
            expect(myStringify(/abc/g)).toBe('{}');
        });
    });

    describe('toJSON', () => {
        test('вызывает toJSON и сериализует результат', () => {
            const obj = { x: 1, toJSON: () => ({ y: 2 }) };
            expect(myStringify(obj)).toBe('{"y":2}');
        });
    });

    describe('Форматирование (space)', () => {
        test('форматирование с отступами', () => {
            const result = myStringify({ a: 1 }, 2);
            expect(result).toBe('{\n  "a": 1\n}');
        });
    });
});