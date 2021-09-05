"use strict";
exports.__esModule = true;
exports.Validator = void 0;
var Errors;
(function (Errors) {
    Errors["noIndexOne"] = "there is not index 1 in steps";
    Errors["indexReincarnation"] = "this step has same index as before step";
    Errors["brokenChain"] = "there is broken chain on";
})(Errors || (Errors = {}));
var Validator = /** @class */ (function () {
    function Validator() {
    }
    Validator.step = function (step, scenario) {
        if (scenario.indexOf(step) == 0 && scenario[scenario.indexOf(step)].index != 1)
            throw new Error(Errors.noIndexOne);
        if (scenario.indexOf(step) != 0) {
            if (scenario[scenario.indexOf(step)].index - scenario[scenario.indexOf(step) - 1].index != 1) {
                throw new TypeError(Errors.brokenChain + " " + (scenario.indexOf(step) + 1) + " or " + Errors.indexReincarnation);
            }
        }
    };
    return Validator;
}());
exports.Validator = Validator;
;
