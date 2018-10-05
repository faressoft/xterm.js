"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var Buffer_1 = require("./Buffer");
var CircularList_1 = require("./common/CircularList");
var TestUtils_test_1 = require("./utils/TestUtils.test");
var INIT_COLS = 80;
var INIT_ROWS = 24;
describe('Buffer', function () {
    var terminal;
    var buffer;
    beforeEach(function () {
        terminal = new TestUtils_test_1.MockTerminal();
        terminal.cols = INIT_COLS;
        terminal.rows = INIT_ROWS;
        terminal.options.scrollback = 1000;
        buffer = new Buffer_1.Buffer(terminal, true);
    });
    describe('constructor', function () {
        it('should create a CircularList with max length equal to rows + scrollback, for its lines', function () {
            chai_1.assert.instanceOf(buffer.lines, CircularList_1.CircularList);
            chai_1.assert.equal(buffer.lines.maxLength, terminal.rows + terminal.options.scrollback);
        });
        it('should set the Buffer\'s scrollBottom value equal to the terminal\'s rows -1', function () {
            chai_1.assert.equal(buffer.scrollBottom, terminal.rows - 1);
        });
    });
    describe('fillViewportRows', function () {
        it('should fill the buffer with blank lines based on the size of the viewport', function () {
            var blankLineChar = terminal.blankLine()[0];
            buffer.fillViewportRows();
            chai_1.assert.equal(buffer.lines.length, INIT_ROWS);
            for (var y = 0; y < INIT_ROWS; y++) {
                chai_1.assert.equal(buffer.lines.get(y).length, INIT_COLS);
                for (var x = 0; x < INIT_COLS; x++) {
                    chai_1.assert.deepEqual(buffer.lines.get(y)[x], blankLineChar);
                }
            }
        });
    });
    describe('getWrappedRangeForLine', function () {
        describe('non-wrapped', function () {
            it('should return a single row for the first row', function () {
                buffer.fillViewportRows();
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(0), { first: 0, last: 0 });
            });
            it('should return a single row for a middle row', function () {
                buffer.fillViewportRows();
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(12), { first: 12, last: 12 });
            });
            it('should return a single row for the last row', function () {
                buffer.fillViewportRows();
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(buffer.lines.length - 1), { first: 23, last: 23 });
            });
        });
        describe('wrapped', function () {
            it('should return a range for the first row', function () {
                buffer.fillViewportRows();
                buffer.lines.get(1).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(0), { first: 0, last: 1 });
            });
            it('should return a range for a middle row wrapping upwards', function () {
                buffer.fillViewportRows();
                buffer.lines.get(12).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(12), { first: 11, last: 12 });
            });
            it('should return a range for a middle row wrapping downwards', function () {
                buffer.fillViewportRows();
                buffer.lines.get(13).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(12), { first: 12, last: 13 });
            });
            it('should return a range for a middle row wrapping both ways', function () {
                buffer.fillViewportRows();
                buffer.lines.get(11).isWrapped = true;
                buffer.lines.get(12).isWrapped = true;
                buffer.lines.get(13).isWrapped = true;
                buffer.lines.get(14).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(12), { first: 10, last: 14 });
            });
            it('should return a range for the last row', function () {
                buffer.fillViewportRows();
                buffer.lines.get(23).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(buffer.lines.length - 1), { first: 22, last: 23 });
            });
            it('should return a range for a row that wraps upward to first row', function () {
                buffer.fillViewportRows();
                buffer.lines.get(1).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(1), { first: 0, last: 1 });
            });
            it('should return a range for a row that wraps downward to last row', function () {
                buffer.fillViewportRows();
                buffer.lines.get(buffer.lines.length - 1).isWrapped = true;
                chai_1.assert.deepEqual(buffer.getWrappedRangeForLine(buffer.lines.length - 2), { first: 22, last: 23 });
            });
        });
    });
    describe('resize', function () {
        describe('column size is reduced', function () {
            it('should not trim the data in the buffer', function () {
                buffer.fillViewportRows();
                buffer.resize(INIT_COLS / 2, INIT_ROWS);
                chai_1.assert.equal(buffer.lines.length, INIT_ROWS);
                for (var i = 0; i < INIT_ROWS; i++) {
                    chai_1.assert.equal(buffer.lines.get(i).length, INIT_COLS);
                }
            });
        });
        describe('column size is increased', function () {
            it('should add pad columns', function () {
                buffer.fillViewportRows();
                buffer.resize(INIT_COLS + 10, INIT_ROWS);
                chai_1.assert.equal(buffer.lines.length, INIT_ROWS);
                for (var i = 0; i < INIT_ROWS; i++) {
                    chai_1.assert.equal(buffer.lines.get(i).length, INIT_COLS + 10);
                }
            });
        });
        describe('row size reduced', function () {
            it('should trim blank lines from the end', function () {
                buffer.fillViewportRows();
                buffer.resize(INIT_COLS, INIT_ROWS - 10);
                chai_1.assert.equal(buffer.lines.length, INIT_ROWS - 10);
            });
            it('should move the viewport down when it\'s at the end', function () {
                buffer.fillViewportRows();
                buffer.y = INIT_ROWS - 5 - 1;
                buffer.resize(INIT_COLS, INIT_ROWS - 10);
                chai_1.assert.equal(buffer.lines.length, INIT_ROWS - 5);
                chai_1.assert.equal(buffer.ydisp, 5);
                chai_1.assert.equal(buffer.ybase, 5);
            });
            describe('no scrollback', function () {
                it('should trim from the top of the buffer when the cursor reaches the bottom', function () {
                    terminal.options.scrollback = 0;
                    buffer = new Buffer_1.Buffer(terminal, true);
                    chai_1.assert.equal(buffer.lines.maxLength, INIT_ROWS);
                    buffer.y = INIT_ROWS - 1;
                    buffer.fillViewportRows();
                    buffer.lines.get(5)[0][1] = 'a';
                    buffer.lines.get(INIT_ROWS - 1)[0][1] = 'b';
                    buffer.resize(INIT_COLS, INIT_ROWS - 5);
                    chai_1.assert.equal(buffer.lines.get(0)[0][1], 'a');
                    chai_1.assert.equal(buffer.lines.get(INIT_ROWS - 1 - 5)[0][1], 'b');
                });
            });
        });
        describe('row size increased', function () {
            describe('empty buffer', function () {
                it('should add blank lines to end', function () {
                    buffer.fillViewportRows();
                    chai_1.assert.equal(buffer.ydisp, 0);
                    buffer.resize(INIT_COLS, INIT_ROWS + 10);
                    chai_1.assert.equal(buffer.ydisp, 0);
                    chai_1.assert.equal(buffer.lines.length, INIT_ROWS + 10);
                });
            });
            describe('filled buffer', function () {
                it('should show more of the buffer above', function () {
                    buffer.fillViewportRows();
                    for (var i = 0; i < 10; i++) {
                        buffer.lines.push(terminal.blankLine());
                    }
                    buffer.y = INIT_ROWS - 1;
                    buffer.ybase = 10;
                    buffer.ydisp = 10;
                    chai_1.assert.equal(buffer.lines.length, INIT_ROWS + 10);
                    buffer.resize(INIT_COLS, INIT_ROWS + 5);
                    chai_1.assert.equal(buffer.ydisp, 5);
                    chai_1.assert.equal(buffer.ybase, 5);
                    chai_1.assert.equal(buffer.lines.length, INIT_ROWS + 10);
                });
                it('should show more of the buffer below when the viewport is at the top of the buffer', function () {
                    buffer.fillViewportRows();
                    for (var i = 0; i < 10; i++) {
                        buffer.lines.push(terminal.blankLine());
                    }
                    buffer.y = INIT_ROWS - 1;
                    buffer.ybase = 10;
                    buffer.ydisp = 0;
                    chai_1.assert.equal(buffer.lines.length, INIT_ROWS + 10);
                    buffer.resize(INIT_COLS, INIT_ROWS + 5);
                    chai_1.assert.equal(buffer.ydisp, 0);
                    chai_1.assert.equal(buffer.ybase, 5);
                    chai_1.assert.equal(buffer.lines.length, INIT_ROWS + 10);
                });
            });
        });
        describe('row and column increased', function () {
            it('should resize properly', function () {
                buffer.fillViewportRows();
                buffer.resize(INIT_COLS + 5, INIT_ROWS + 5);
                chai_1.assert.equal(buffer.lines.length, INIT_ROWS + 5);
                for (var i = 0; i < INIT_ROWS + 5; i++) {
                    chai_1.assert.equal(buffer.lines.get(i).length, INIT_COLS + 5);
                }
            });
        });
    });
    describe('buffer marked to have no scrollback', function () {
        it('should always have a scrollback of 0', function () {
            chai_1.assert.equal(terminal.options.scrollback, 1000);
            buffer = new Buffer_1.Buffer(terminal, false);
            buffer.fillViewportRows();
            chai_1.assert.equal(buffer.lines.maxLength, INIT_ROWS);
            buffer.resize(INIT_COLS, INIT_ROWS * 2);
            chai_1.assert.equal(buffer.lines.maxLength, INIT_ROWS * 2);
            buffer.resize(INIT_COLS, INIT_ROWS / 2);
            chai_1.assert.equal(buffer.lines.maxLength, INIT_ROWS / 2);
        });
    });
    describe('addMarker', function () {
        it('should adjust a marker line when the buffer is trimmed', function () {
            terminal.options.scrollback = 0;
            buffer = new Buffer_1.Buffer(terminal, true);
            buffer.fillViewportRows();
            var marker = buffer.addMarker(buffer.lines.length - 1);
            chai_1.assert.equal(marker.line, buffer.lines.length - 1);
            buffer.lines.emit('trim', 1);
            chai_1.assert.equal(marker.line, buffer.lines.length - 2);
        });
        it('should dispose of a marker if it is trimmed off the buffer', function () {
            terminal.options.scrollback = 0;
            buffer = new Buffer_1.Buffer(terminal, true);
            buffer.fillViewportRows();
            chai_1.assert.equal(buffer.markers.length, 0);
            var marker = buffer.addMarker(0);
            chai_1.assert.equal(marker.isDisposed, false);
            chai_1.assert.equal(buffer.markers.length, 1);
            buffer.lines.emit('trim', 1);
            chai_1.assert.equal(marker.isDisposed, true);
            chai_1.assert.equal(buffer.markers.length, 0);
        });
    });
    describe('translateBufferLineToString', function () {
        it('should handle selecting a section of ascii text', function () {
            buffer.lines.set(0, [
                [null, 'a', 1, 'a'.charCodeAt(0)],
                [null, 'b', 1, 'b'.charCodeAt(0)],
                [null, 'c', 1, 'c'.charCodeAt(0)],
                [null, 'd', 1, 'd'.charCodeAt(0)]
            ]);
            var str = buffer.translateBufferLineToString(0, true, 0, 2);
            chai_1.assert.equal(str, 'ab');
        });
        it('should handle a cut-off double width character by including it', function () {
            buffer.lines.set(0, [
                [null, '語', 2, 35486],
                [null, '', 0, null],
                [null, 'a', 1, 'a'.charCodeAt(0)]
            ]);
            var str1 = buffer.translateBufferLineToString(0, true, 0, 1);
            chai_1.assert.equal(str1, '語');
        });
        it('should handle a zero width character in the middle of the string by not including it', function () {
            buffer.lines.set(0, [
                [null, '語', 2, '語'.charCodeAt(0)],
                [null, '', 0, null],
                [null, 'a', 1, 'a'.charCodeAt(0)]
            ]);
            var str0 = buffer.translateBufferLineToString(0, true, 0, 1);
            chai_1.assert.equal(str0, '語');
            var str1 = buffer.translateBufferLineToString(0, true, 0, 2);
            chai_1.assert.equal(str1, '語');
            var str2 = buffer.translateBufferLineToString(0, true, 0, 3);
            chai_1.assert.equal(str2, '語a');
        });
        it('should handle single width emojis', function () {
            buffer.lines.set(0, [
                [null, '😁', 1, '😁'.charCodeAt(0)],
                [null, 'a', 1, 'a'.charCodeAt(0)]
            ]);
            var str1 = buffer.translateBufferLineToString(0, true, 0, 1);
            chai_1.assert.equal(str1, '😁');
            var str2 = buffer.translateBufferLineToString(0, true, 0, 2);
            chai_1.assert.equal(str2, '😁a');
        });
        it('should handle double width emojis', function () {
            buffer.lines.set(0, [
                [null, '😁', 2, '😁'.charCodeAt(0)],
                [null, '', 0, null]
            ]);
            var str1 = buffer.translateBufferLineToString(0, true, 0, 1);
            chai_1.assert.equal(str1, '😁');
            var str2 = buffer.translateBufferLineToString(0, true, 0, 2);
            chai_1.assert.equal(str2, '😁');
            buffer.lines.set(0, [
                [null, '😁', 2, '😁'.charCodeAt(0)],
                [null, '', 0, null],
                [null, 'a', 1, 'a'.charCodeAt(0)]
            ]);
            var str3 = buffer.translateBufferLineToString(0, true, 0, 3);
            chai_1.assert.equal(str3, '😁a');
        });
    });
});
//# sourceMappingURL=Buffer.test.js.map