"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var LRUMap_1 = require("./LRUMap");
describe('LRUMap', function () {
    it('can be used to store and retrieve values', function () {
        var map = new LRUMap_1.default(10);
        map.set('keya', 'valuea');
        map.set('keyb', 'valueb');
        map.set('keyc', 'valuec');
        chai_1.assert.strictEqual(map.get('keya'), 'valuea');
        chai_1.assert.strictEqual(map.get('keyb'), 'valueb');
        chai_1.assert.strictEqual(map.get('keyc'), 'valuec');
    });
    it('maintains a size from insertions', function () {
        var map = new LRUMap_1.default(10);
        chai_1.assert.strictEqual(map.size, 0);
        map.set('a', 'value');
        chai_1.assert.strictEqual(map.size, 1);
        map.set('b', 'value');
        chai_1.assert.strictEqual(map.size, 2);
    });
    it('deletes the oldest entry when the capacity is exceeded', function () {
        var map = new LRUMap_1.default(4);
        map.set('a', 'value');
        map.set('b', 'value');
        map.set('c', 'value');
        map.set('d', 'value');
        map.set('e', 'value');
        chai_1.assert.isNull(map.get('a'));
        chai_1.assert.isNotNull(map.get('b'));
        chai_1.assert.isNotNull(map.get('c'));
        chai_1.assert.isNotNull(map.get('d'));
        chai_1.assert.isNotNull(map.get('e'));
        chai_1.assert.strictEqual(map.size, 4);
    });
    it('prevents a recently accessed entry from getting deleted', function () {
        var map = new LRUMap_1.default(2);
        map.set('a', 'value');
        map.set('b', 'value');
        map.get('a');
        map.set('c', 'value');
        chai_1.assert.isNotNull(map.get('a'));
        chai_1.assert.isNull(map.get('b'));
        chai_1.assert.isNotNull(map.get('c'));
    });
    it('supports mutation', function () {
        var map = new LRUMap_1.default(10);
        map.set('keya', 'oldvalue');
        map.set('keya', 'newvalue');
        chai_1.assert.strictEqual(map.size, 1);
        chai_1.assert.strictEqual(map.get('keya'), 'newvalue');
    });
});
//# sourceMappingURL=LRUMap.test.js.map