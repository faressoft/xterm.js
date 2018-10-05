"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsdom = require("jsdom");
var chai_1 = require("chai");
var DomRendererRowFactory_1 = require("./DomRendererRowFactory");
var Buffer_1 = require("../../Buffer");
describe('DomRendererRowFactory', function () {
    var dom;
    var rowFactory;
    var lineData;
    beforeEach(function () {
        dom = new jsdom.JSDOM('');
        rowFactory = new DomRendererRowFactory_1.DomRendererRowFactory(dom.window.document);
        lineData = createEmptyLineData(2);
    });
    describe('createRow', function () {
        it('should create an element for every character in the row', function () {
            var fragment = rowFactory.createRow(lineData, false, 0, 5, 20);
            chai_1.assert.equal(getFragmentHtml(fragment), '<span> </span>' +
                '<span> </span>');
        });
        it('should set correct attributes for double width characters', function () {
            lineData[0] = [Buffer_1.DEFAULT_ATTR, '語', 2, '語'.charCodeAt(0)];
            lineData[1] = [Buffer_1.DEFAULT_ATTR, '', 0, undefined];
            var fragment = rowFactory.createRow(lineData, false, 0, 5, 20);
            chai_1.assert.equal(getFragmentHtml(fragment), '<span style="width: 10px;">語</span>');
        });
        it('should add class for cursor', function () {
            var fragment = rowFactory.createRow(lineData, true, 0, 5, 20);
            chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-cursor"> </span>' +
                '<span> </span>');
        });
        it('should not render cells that go beyond the terminal\'s columns', function () {
            lineData[0] = [Buffer_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)];
            lineData[1] = [Buffer_1.DEFAULT_ATTR, 'b', 1, 'b'.charCodeAt(0)];
            var fragment = rowFactory.createRow(lineData, false, 0, 5, 1);
            chai_1.assert.equal(getFragmentHtml(fragment), '<span>a</span>');
        });
        describe('attributes', function () {
            it('should add class for bold', function () {
                lineData[0] = [Buffer_1.DEFAULT_ATTR | (1 << 18), 'a', 1, 'a'.charCodeAt(0)];
                var fragment = rowFactory.createRow(lineData, false, 0, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-bold">a</span>' +
                    '<span> </span>');
            });
            it('should add class for italic', function () {
                lineData[0] = [Buffer_1.DEFAULT_ATTR | (64 << 18), 'a', 1, 'a'.charCodeAt(0)];
                var fragment = rowFactory.createRow(lineData, false, 0, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-italic">a</span>' +
                    '<span> </span>');
            });
            it('should add classes for 256 foreground colors', function () {
                var defaultAttrNoFgColor = (0 << 9) | (256 << 0);
                for (var i = 0; i < 256; i++) {
                    lineData[0] = [defaultAttrNoFgColor | (i << 9), 'a', 1, 'a'.charCodeAt(0)];
                    var fragment = rowFactory.createRow(lineData, false, 0, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), "<span class=\"xterm-fg-" + i + "\">a</span>" +
                        '<span> </span>');
                }
            });
            it('should add classes for 256 background colors', function () {
                var defaultAttrNoBgColor = (257 << 9) | (0 << 0);
                for (var i = 0; i < 256; i++) {
                    lineData[0] = [defaultAttrNoBgColor | (i << 0), 'a', 1, 'a'.charCodeAt(0)];
                    var fragment = rowFactory.createRow(lineData, false, 0, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), "<span class=\"xterm-bg-" + i + "\">a</span>" +
                        '<span> </span>');
                }
            });
            it('should correctly invert colors', function () {
                lineData[0] = [(8 << 18) | (2 << 9) | (1 << 0), 'a', 1, 'a'.charCodeAt(0)];
                var fragment = rowFactory.createRow(lineData, false, 0, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-fg-1 xterm-bg-2">a</span>' +
                    '<span> </span>');
            });
            it('should correctly invert default fg color', function () {
                lineData[0] = [(8 << 18) | (257 << 9) | (1 << 0), 'a', 1, 'a'.charCodeAt(0)];
                var fragment = rowFactory.createRow(lineData, false, 0, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-fg-1 xterm-bg-15">a</span>' +
                    '<span> </span>');
            });
            it('should correctly invert default bg color', function () {
                lineData[0] = [(8 << 18) | (1 << 9) | (256 << 0), 'a', 1, 'a'.charCodeAt(0)];
                var fragment = rowFactory.createRow(lineData, false, 0, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-fg-0 xterm-bg-1">a</span>' +
                    '<span> </span>');
            });
            it('should turn bold fg text bright', function () {
                for (var i = 0; i < 8; i++) {
                    lineData[0] = [(1 << 18) | (i << 9) | (256 << 0), 'a', 1, 'a'.charCodeAt(0)];
                    var fragment = rowFactory.createRow(lineData, false, 0, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), "<span class=\"xterm-bold xterm-fg-" + (i + 8) + "\">a</span>" +
                        '<span> </span>');
                }
            });
        });
    });
    function getFragmentHtml(fragment) {
        var element = dom.window.document.createElement('div');
        element.appendChild(fragment);
        return element.innerHTML;
    }
    function createEmptyLineData(cols) {
        var lineData = [];
        for (var i = 0; i < cols; i++) {
            lineData.push([Buffer_1.DEFAULT_ATTR, ' ', 1, 32]);
        }
        return lineData;
    }
});
//# sourceMappingURL=DomRendererRowFactory.test.js.map