"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.Transaction = void 0;
var validation_1 = require("./validation");
var Transaction = /** @class */ (function () {
    function Transaction() {
        this.logs = [];
        this.scenarioInfo = {
            status: true,
            sortedArr: [],
            store: [],
            error: null
        };
    }
    Transaction.prototype.dispatch = function (scenario) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.sortSteps(scenario, this.scenarioInfo.sortedArr);
                        this.createArrforstore(scenario.length, this.scenarioInfo.store);
                        this.store = {};
                        return [4 /*yield*/, this.followSteps(this.scenarioInfo.sortedArr, this.scenarioInfo, this.scenarioInfo.store)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Transaction.prototype.sortSteps = function (scenario, sortArray) {
        for (var i = 0; i < scenario.length; i++) {
            sortArray[i] = {};
        }
        for (var _i = 0, scenario_1 = scenario; _i < scenario_1.length; _i++) {
            var step = scenario_1[_i];
            if (step.index) {
                if (sortArray[step.index - 1] != {}) {
                    findfreespace(sortArray, step, sortArray[step.index - 1]);
                }
                else
                    sortArray[step.index - 1] = step;
            }
            else {
                sortArray[sortArray.indexOf({})] = step;
            }
        }
        function findfreespace(sortArray, newitem, olditem) {
            sortArray[newitem.index - 1] = newitem;
            sortArray[sortArray.indexOf({})] = olditem;
        }
    };
    Transaction.prototype.createArrforstore = function (amount, store) {
        for (var i = 0; i <= amount; i++) {
            store[i] = {};
        }
    };
    Transaction.prototype.deepCopy = function (obj1, obj2) {
        for (var property in obj1) {
            if (obj1[property] instanceof Map) {
                obj2[property] = new Map(__spreadArray([], obj1[property]));
            }
            else if (obj1[property] instanceof Set) {
                obj2[property] = new Set(__spreadArray([], obj1[property]));
            }
            else if (typeof obj1[property] == 'object' && !(Array.isArray(obj1[property])) && obj1[property] != null) {
                obj2[property] = {};
                this.deepCopy(obj1[property], obj2[property]);
            }
            else if (Array.isArray(obj1[property])) {
                obj2[property] = [];
                this.deepCopy(obj1[property], obj2[property]);
            }
            else {
                obj2[property] = obj1[property];
            }
        }
    };
    Transaction.prototype.followSteps = function (scenario, scenarioInfo, stores) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, scenario_2, step, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, scenario_2 = scenario;
                        _a.label = 1;
                    case 1:
                        if (!(_i < scenario_2.length)) return [3 /*break*/, 9];
                        step = scenario_2[_i];
                        if (!scenarioInfo.status) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 6]);
                        validation_1.Validator.step(step, scenario);
                        return [4 /*yield*/, step.call(this['store'])];
                    case 3:
                        _a.sent();
                        this.deepCopy(this['store'], stores[scenario.indexOf(step) + 1]);
                        this.logs.push({
                            index: step.index,
                            meta: step.meta,
                            storeBefore: stores[scenario.indexOf(step)],
                            storeAfter: stores[scenario.indexOf(step) + 1],
                            error: null
                        });
                        scenarioInfo.status = true;
                        if (scenario.indexOf(step) == scenario.length - 1) {
                            this.logs = [];
                            this['store'] = {};
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _a.sent();
                        scenarioInfo.status = false;
                        if (typeof step === 'object' && !Array.isArray(step)) {
                            this.logs.push({
                                index: step.index,
                                meta: step.meta,
                                error: {
                                    name: err_1.name,
                                    message: err_1.message,
                                    stack: err_1.stack
                                }
                            });
                        }
                        else {
                            this.logs.push({
                                index: undefined,
                                meta: undefined,
                                error: {
                                    name: err_1.name,
                                    message: err_1.message,
                                    stack: err_1.stack
                                }
                            });
                        }
                        return [4 /*yield*/, this.rollback(scenario, scenarioInfo, scenario.indexOf(step) - 1)];
                    case 5:
                        _a.sent();
                        throw this.logs;
                    case 6: return [3 /*break*/, 8];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        _i++;
                        return [3 /*break*/, 1];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Transaction.prototype.rollback = function (scenario, scenarioInfo, errorIndex) {
        return __awaiter(this, void 0, void 0, function () {
            function checkRestore(restore, step, self) {
                if (restore) {
                    if (typeof restore != 'function') {
                        try {
                            throw new Error("type of restore isn't function");
                        }
                        catch (error) {
                            self.logs.push({
                                index: step.index,
                                meta: step.meta,
                                error: {
                                    name: error.name,
                                    message: error.message,
                                    stack: error.stack
                                }
                            });
                            throw self.logs;
                        }
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
            function PutStepInLog(store, index, self, skip) {
                self.logs.push({
                    index: scenario[index].index,
                    meta: scenario[index].meta,
                    storeBefore: scenarioInfo.store[index + 1 + skip],
                    storeAfter: store[index + 1],
                    error: null
                });
            }
            function createNewStore(store, oldStore, self) {
                for (var i in oldStore) {
                    store[i] = {};
                    self.deepCopy(oldStore[i], store[i]);
                }
            }
            var store, restoreSkip, i, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = [];
                        restoreSkip = 0;
                        createNewStore(store, scenarioInfo.store, this);
                        i = errorIndex;
                        _a.label = 1;
                    case 1:
                        if (!(i >= 0)) return [3 /*break*/, 7];
                        if (!(checkRestore(scenario[i].restore, scenario[i], this))) {
                            restoreSkip += 1;
                            Object.assign(store[i], store[i + 1]);
                            return [3 /*break*/, 6];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, scenario[i].restore(store[i + 1])];
                    case 3:
                        _a.sent();
                        Object.assign(store[i], store[i + 1]);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        this.logs.push({
                            index: scenario[i].index,
                            meta: scenario[i].meta,
                            error: {
                                name: error_1.name,
                                message: error_1.message,
                                stack: error_1.stack
                            }
                        });
                        throw this.logs;
                    case 5:
                        PutStepInLog(store, i, this, restoreSkip);
                        _a.label = 6;
                    case 6:
                        i--;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return Transaction;
}());
exports.Transaction = Transaction;
