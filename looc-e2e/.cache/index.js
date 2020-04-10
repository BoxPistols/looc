import React, { useState } from "react";
var Counter = function (_a) {
    var _b = _a.firstNumber, firstNumber = _b === void 0 ? 0 : _b, _c = _a.secondNumber, secondNumber = _c === void 0 ? 0 : _c, _d = _a.someText, someText = _d === void 0 ? "" : _d;
    var _e = useState(null), st = _e[0], setSt = _e[1];
    var sum = Number(firstNumber) + Number(secondNumber);
    return (React.createElement("div", null,
        "Here's some text: ",
        someText,
        React.createElement("div", null,
            firstNumber,
            " + ",
            secondNumber,
            " = ",
            sum)));
};
export default Counter;
