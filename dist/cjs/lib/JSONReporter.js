"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _reporter = _interopRequireDefault(require("@wdio/reporter"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
/**
 * Custom JSON Reporter that generates a report with timestamps,
 * optional screenshots, browser logs, spec console logs, and metadata for WebDriverIO tests.
 *
 * Options:
 * - outputFile: the path where the JSON file is to be written.
 * - screenshotOption: "No" (default), "OnFailure", or "Full"
 * - history: number of history records to retain (default 5)
 * - historyPath: path where the individual/aggregated history report should be generated (if provided)
 */
var JSONReporter = exports["default"] = /*#__PURE__*/function (_WDIOReporter) {
  function JSONReporter(options) {
    var _this;
    _classCallCheck(this, JSONReporter);
    // Default options.
    options = Object.assign({
      stdout: true,
      screenshotOption: 'No',
      history: 5,
      historyPath: null
    }, options);
    _this = _callSuper(this, JSONReporter, [options]);
    _this.options = options;
    _this.testResults = [];
    _this.testResultUids = new Set();

    // Use a global executionId so that all reporter instances (across spec files) share the same one.
    if (!JSONReporter.globalExecutionId) {
      JSONReporter.globalExecutionId = Date.now().toString();
    }
    _this.executionId = JSONReporter.globalExecutionId;
    _this.executionStartTime = new Date();

    // Ensure the output directory exists.
    _fs["default"].mkdirSync(_path["default"].dirname(_this.options.outputFile), {
      recursive: true
    });

    // Buffer to capture spec file console logs for each test.
    _this.currentTestSpecLogs = [];
    return _this;
  }

  /**
   * Reset spec log buffer when a test starts.
   */
  _inherits(JSONReporter, _WDIOReporter);
  return _createClass(JSONReporter, [{
    key: "onTestStart",
    value: function onTestStart(test) {
      this.currentTestSpecLogs = [];
    }

    /**
     * Capture any stdout output from the spec files.
     */
  }, {
    key: "onStdout",
    value: function onStdout(chunk, pid) {
      if (this.currentTestSpecLogs) {
        this.currentTestSpecLogs.push(chunk.toString());
      }
    }
  }, {
    key: "onRunnerEnd",
    value: function () {
      var _onRunnerEnd = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.writeJSONReport();
            case 2:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function onRunnerEnd() {
        return _onRunnerEnd.apply(this, arguments);
      }
      return onRunnerEnd;
    }()
  }, {
    key: "onTestPass",
    value: function () {
      var _onTestPass = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(test) {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return this.addTestResult(test, 'PASSED');
            case 2:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function onTestPass(_x) {
        return _onTestPass.apply(this, arguments);
      }
      return onTestPass;
    }()
  }, {
    key: "onTestFail",
    value: function () {
      var _onTestFail = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(test) {
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return this.addTestResult(test, 'FAILED');
            case 2:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function onTestFail(_x2) {
        return _onTestFail.apply(this, arguments);
      }
      return onTestFail;
    }()
    /**
     * Captures test result details along with optional screenshot,
     * browser logs, and spec console logs.
     */
  }, {
    key: "addTestResult",
    value: (function () {
      var _addTestResult = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(test, status) {
        var _this2 = this;
        var date, timestamp, uid, suiteName, errors, screenshotPath, screenshotData, screenshotDir, hash, safeTimestamp, screenshotFileName, browserConsoleLogs, specConsoleLogs;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              date = new Date(); // Extract only the time portion in HH:MM:SS format (e.g. "16:35:30")
              timestamp = date.toISOString().split('T')[1].split('.')[0];
              uid = test.uid || "".concat(test.title, "-").concat(timestamp);
              suiteName = test.parent ? test.parent.replace(/suite\d+/gi, '').trim() : 'Default Suite'; // Handle multiple errors
              errors = test.errors ? test.errors.map(function (error) {
                return {
                  message: _this2.sanitizeErrorMessage(error.message, true),
                  stack: _this2.sanitizeErrorMessage(error.stack, true)
                };
              }) : [];
              screenshotPath = ''; // Capture screenshot if enabled.
              if (!(this.options.screenshotOption === 'Full' || this.options.screenshotOption === 'OnFailure' && status === 'FAILED')) {
                _context4.next = 23;
                break;
              }
              _context4.prev = 7;
              _context4.next = 10;
              return browser.takeScreenshot();
            case 10:
              screenshotData = _context4.sent;
              screenshotDir = _path["default"].join(_path["default"].dirname(this.options.outputFile), 'screenshots');
              _fs["default"].mkdirSync(screenshotDir, {
                recursive: true
              });
              hash = this.generateShortHash(test.title);
              safeTimestamp = this.formatDateForFilename(date);
              screenshotFileName = "screenshot-".concat(hash, "-").concat(safeTimestamp, ".png");
              screenshotPath = _path["default"].join(screenshotDir, screenshotFileName);
              _fs["default"].writeFileSync(screenshotPath, screenshotData, 'base64');
              _context4.next = 23;
              break;
            case 20:
              _context4.prev = 20;
              _context4.t0 = _context4["catch"](7);
              console.error('Error capturing screenshot: ', _context4.t0);
            case 23:
              // Capture browser logs (if available).
              browserConsoleLogs = [];
              if (!(browser && !browser.isW3C && typeof browser.getLogs === 'function' && browser.logTypes && browser.logTypes.includes('browser'))) {
                _context4.next = 34;
                break;
              }
              _context4.prev = 25;
              _context4.next = 28;
              return browser.getLogs('browser');
            case 28:
              browserConsoleLogs = _context4.sent;
              _context4.next = 34;
              break;
            case 31:
              _context4.prev = 31;
              _context4.t1 = _context4["catch"](25);
              if (_context4.t1.code === 'ECONNREFUSED') {
                console.warn('Browser logs not available: Connection refused');
              } else {
                console.error('Error capturing browser logs: ', _context4.t1);
              }
            case 34:
              // Get spec file console logs.
              specConsoleLogs = this.currentTestSpecLogs || [];
              this.currentTestSpecLogs = [];
              if (!this.testResultUids.has(uid)) {
                this.testResults.push({
                  uid: uid,
                  timestamp: timestamp,
                  // e.g., "16:35:30"
                  suiteName: suiteName,
                  testName: test.title,
                  status: status,
                  errors: errors,
                  screenshot: screenshotPath,
                  browserConsoleLogs: browserConsoleLogs,
                  specConsoleLogs: specConsoleLogs
                });
                this.testResultUids.add(uid);
              }
            case 37:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this, [[7, 20], [25, 31]]);
      }));
      function addTestResult(_x3, _x4) {
        return _addTestResult.apply(this, arguments);
      }
      return addTestResult;
    }())
  }, {
    key: "writeJSONReport",
    value: function () {
      var _writeJSONReport = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
        var executionEnd, totalTimeMinutes, browserName, metadata, report, fileTimestamp, fileName, outputDir, outputFile;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              executionEnd = new Date();
              totalTimeMinutes = ((executionEnd - this.executionStartTime) / 60000).toFixed(2);
              browserName = browser && browser.capabilities && browser.capabilities.browserName ? browser.capabilities.browserName : 'Unknown'; // Include the shared executionId in the metadata.
              metadata = {
                executionId: this.executionId,
                browserName: browserName,
                executionStartTime: this.executionStartTime.toUTCString(),
                executionEndTime: executionEnd.toUTCString(),
                totalTimeInMinutes: totalTimeMinutes
              };
              report = {
                metadata: metadata,
                testResults: this.testResults
              };
              fileTimestamp = this.formatDateForFilename(new Date());
              fileName = "test-report-".concat(fileTimestamp, ".json");
              outputDir = _path["default"].dirname(this.options.outputFile);
              outputFile = _path["default"].join(outputDir, fileName);
              _fs["default"].writeFileSync(outputFile, JSON.stringify(report, null, 2));
              console.log("JSON report successfully written to ".concat(outputFile));
            case 11:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this);
      }));
      function writeJSONReport() {
        return _writeJSONReport.apply(this, arguments);
      }
      return writeJSONReport;
    }()
    /**
     * Helper to create a filename-safe timestamp string from a Date object.
     */
  }, {
    key: "formatDateForFilename",
    value: function formatDateForFilename(date) {
      return date.toUTCString().replace(/,/g, '').replace(/:/g, '-').replace(/\s+/g, '_');
    }

    /**
     * Sanitizes error messages by removing ANSI escape sequences.
     */
  }, {
    key: "sanitizeErrorMessage",
    value: function sanitizeErrorMessage(errorMessage) {
      var full = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (!errorMessage) return '';
      var sanitized = errorMessage.replace(/[\u001b\u009b]\[\d{1,2}(;\d{1,2})?(m|K)/g, '').trim();
      return full ? sanitized : sanitized.split('\n')[0];
    }

    /**
     * Generates a short non-cryptographic hash for a given string.
     */
  }, {
    key: "generateShortHash",
    value: function generateShortHash(input) {
      var hash = 0;
      if (input.length === 0) return '00000000';
      for (var i = 0; i < input.length; i++) {
        hash = (hash << 5) - hash + input.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(16).padStart(8, '0').substring(0, 8);
    }

    /**
     * Static method to generate an aggregated history record.
     * It scans all JSON report files (matching the pattern 'test-report-*.json') in the provided report directories,
     * aggregates the results (summing test counts and merging suite data), compares with the last aggregated record
     * (if available) to compute defect comparisons, and appends the aggregated record
     * to the specified history file. The method returns the aggregated history record.
     *
     * Options:
     * - reportPaths: Directory path (or array of paths) containing JSON report files.
     * - historyPath: File path where the aggregated history record should be appended.
     * - maxHistory: Maximum number of history records to retain (default: 5).
     */
  }], [{
    key: "generateAggregateHistory",
    value: function generateAggregateHistory(_ref) {
      var reportPaths = _ref.reportPaths,
        historyPath = _ref.historyPath,
        _ref$maxHistory = _ref.maxHistory,
        maxHistory = _ref$maxHistory === void 0 ? 5 : _ref$maxHistory;
      // If reportPaths is not an array, wrap it in an array.
      if (!Array.isArray(reportPaths)) {
        reportPaths = [reportPaths];
      }
      var aggregated = {
        executionStartTime: null,
        executionEndTime: null,
        totalTests: 0,
        passed: 0,
        failed: 0,
        suites: {} // For each suite: { totalTests, passed, failed, errors: {} }
      };

      // Process each provided report directory.
      reportPaths.forEach(function (reportDir) {
        if (!_fs["default"].existsSync(reportDir)) {
          console.warn("Report directory not found: ".concat(reportDir));
          return;
        }
        var files = _fs["default"].readdirSync(reportDir).filter(function (file) {
          return file.startsWith('test-report-') && file.endsWith('.json');
        });
        files.forEach(function (file) {
          // Using simple concatenation instead of path.join.
          var filePath = reportDir + '/' + file;
          try {
            var data = _fs["default"].readFileSync(filePath, 'utf8');
            var jsonData = JSON.parse(data);

            // Update aggregated start time (earliest) and end time (latest).
            var fileStart = new Date(jsonData.metadata.executionStartTime);
            if (!aggregated.executionStartTime || fileStart < new Date(aggregated.executionStartTime)) {
              aggregated.executionStartTime = jsonData.metadata.executionStartTime;
            }
            var fileEnd = new Date(jsonData.metadata.executionEndTime);
            if (!aggregated.executionEndTime || fileEnd > new Date(aggregated.executionEndTime)) {
              aggregated.executionEndTime = jsonData.metadata.executionEndTime;
            }

            // Sum tests and update counts.
            aggregated.totalTests += jsonData.testResults.length;
            var passedCount = jsonData.testResults.filter(function (result) {
              return result.status === 'PASSED';
            }).length;
            var failedCount = jsonData.testResults.filter(function (result) {
              return result.status === 'FAILED';
            }).length;
            aggregated.passed += passedCount;
            aggregated.failed += failedCount;

            // Aggregate suite data.
            jsonData.testResults.forEach(function (result) {
              var suiteName = result.suiteName || 'Default Suite';
              if (!aggregated.suites[suiteName]) {
                aggregated.suites[suiteName] = {
                  totalTests: 0,
                  passed: 0,
                  failed: 0,
                  errors: {}
                };
              }
              aggregated.suites[suiteName].totalTests++;
              if (result.status === 'PASSED') {
                aggregated.suites[suiteName].passed++;
              } else if (result.status === 'FAILED') {
                aggregated.suites[suiteName].failed++;
                // Track ALL error messages (not just one per test)
                if (result.errors) {
                  result.errors.forEach(function (error) {
                    var errorMsg = error.message;
                    // Use testName + errorMsg as a unique key
                    var errorKey = "".concat(result.testName, "-").concat(errorMsg);
                    aggregated.suites[suiteName].errors[errorKey] = errorMsg;
                  });
                }
              }
            });
          } catch (err) {
            console.error("Error processing file ".concat(filePath, ":"), err);
          }
        });
      });

      // Read existing history data.
      var historyData = [];
      if (_fs["default"].existsSync(historyPath)) {
        try {
          var data = _fs["default"].readFileSync(historyPath, 'utf8');
          historyData = JSON.parse(data);
          if (!Array.isArray(historyData)) {
            historyData = [];
          }
        } catch (err) {
          console.error('Error reading history file:', err);
        }
      }

      // Compute defectComparison using the last aggregated record if available.
      var previousRecord = historyData.length > 0 ? historyData[historyData.length - 1] : null;

      // For each suite in the current aggregated data:
      var _loop = function _loop(suiteName) {
        var _previousRecord$suite;
        var currentErrors = Object.keys(aggregated.suites[suiteName].errors);
        var previousErrors = [];
        if (previousRecord !== null && previousRecord !== void 0 && (_previousRecord$suite = previousRecord.suites) !== null && _previousRecord$suite !== void 0 && (_previousRecord$suite = _previousRecord$suite[suiteName]) !== null && _previousRecord$suite !== void 0 && _previousRecord$suite.errors) {
          previousErrors = Object.keys(previousRecord.suites[suiteName].errors);
        }
        var newDefects = currentErrors.filter(function (key) {
          return !previousErrors.includes(key);
        }).map(function (key) {
          return aggregated.suites[suiteName].errors[key];
        });
        var resolvedDefects = previousErrors.filter(function (key) {
          return !currentErrors.includes(key);
        }).map(function (key) {
          return previousRecord.suites[suiteName].errors[key];
        });
        aggregated.suites[suiteName].defectComparison = {
          newDefects: newDefects,
          resolvedDefects: resolvedDefects
        };
      };
      for (var suiteName in aggregated.suites) {
        _loop(suiteName);
      }

      // Create the aggregated history record using the full UTC timestamp.
      var aggregatedHistoryRecord = {
        timestamp: new Date().toUTCString(),
        executionStartTime: aggregated.executionStartTime,
        executionEndTime: aggregated.executionEndTime,
        totalTests: aggregated.totalTests,
        passed: aggregated.passed,
        failed: aggregated.failed,
        suites: aggregated.suites
      };

      // Append the new aggregated record.
      historyData.push(aggregatedHistoryRecord);
      // Retain only the last maxHistory records.
      if (historyData.length > maxHistory) {
        historyData = historyData.slice(historyData.length - maxHistory);
      }
      try {
        // Create directory if needed using simple string concatenation.
        var historyDir = historyPath.substring(0, historyPath.lastIndexOf('/'));
        if (!_fs["default"].existsSync(historyDir)) {
          _fs["default"].mkdirSync(historyDir, {
            recursive: true
          });
        }
        _fs["default"].writeFileSync(historyPath, JSON.stringify(historyData, null, 2));
        console.log("Aggregated history record appended to ".concat(historyPath));
      } catch (err) {
        console.error('Error writing history file:', err);
      }
      return aggregatedHistoryRecord;
    }
  }]);
}(_reporter["default"]); // Ensure that the aggregated history is written only once if needed.
JSONReporter.aggregatedHistoryWritten = false;