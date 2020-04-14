import React, { useState, useEffect } from './react.js';
import ReactDOM from './react-dom.js';

var ArrayType;
(function (ArrayType) {
    ArrayType[ArrayType["String"] = 0] = "String";
    ArrayType[ArrayType["Number"] = 1] = "Number";
    ArrayType[ArrayType["Boolean"] = 2] = "Boolean";
    ArrayType[ArrayType["Nothing"] = 3] = "Nothing";
})(ArrayType || (ArrayType = {}));
var PrimitiveType;
(function (PrimitiveType) {
    PrimitiveType["String"] = "string";
    PrimitiveType["Boolean"] = "boolean";
    PrimitiveType["Number"] = "number";
    PrimitiveType["Nothing"] = "nothing";
})(PrimitiveType || (PrimitiveType = {}));
const isString = (t) => {
    return t === PrimitiveType.String;
};
const isBoolean = (t) => {
    return t === PrimitiveType.Boolean;
};
const isNumber = (t) => {
    return t === PrimitiveType.Number;
};
const isStringArray = (t) => {
    return Array.isArray(t) && t[0] === PrimitiveType.String;
};
const isNumberArray = (t) => {
    return Array.isArray(t) && t[0] === PrimitiveType.Number;
};
const isBoolArray = (t) => {
    return Array.isArray(t) && t[0] === PrimitiveType.Boolean;
};
const isInterface = (t) => {
    return typeof t === "object" && t !== null && !Array.isArray(t);
};
const getPropTypesByComponent = (componentName) => (interfaces) => {
    const propTypes = `${componentName}Props`;
    return interfaces[propTypes];
};

const setDefaultValues = (propTypes) => {
    const defaultProps = {};
    for (const [prop, type] of Object.entries(propTypes)) {
        if (isNumber(type))
            defaultProps[prop] = 0;
        if (isBoolean(type))
            defaultProps[prop] = false;
        if (isString(type))
            defaultProps[prop] = "Text";
        if (isNumberArray(type))
            defaultProps[prop] = [0, 1, 2];
        if (isStringArray(type))
            defaultProps[prop] = ["Text", "Text", "Text"];
        if (isBoolArray(type))
            defaultProps[prop] = [true, true, true];
        if (isInterface(type))
            defaultProps[prop] = setDefaultValues(type);
    }
    return defaultProps;
};
const Loader = ({ debugProps, debugPropTypes, debugComponent, }) => {
    const [imports, setImports] = useState(debugComponent || null);
    const [propTypes, setPropTypes] = useState(debugPropTypes || null);
    const [props, setProps] = useState(debugProps || {});
    const createInputs = (propTypes) => {
        const inputs = [];
        const getInputType = (type) => {
            if (isNumber(type))
                return { type: "number", isArray: false };
            if (isBoolean(type))
                return { type: "checkbox", isArray: false };
            if (isString(type))
                return { type: "text", isArray: false };
            if (isStringArray(type))
                return { type: "text", isArray: true };
            if (isNumberArray(type))
                return { type: "number", isArray: true };
            return { type: "unknown", isArray: false };
        };
        const createCheckboxInput = (handleChange) => (React.createElement("input", { type: "checkbox", defaultChecked: false, onChange: handleChange }));
        const createNumberInput = (handleChange) => (React.createElement("input", { type: "number", defaultValue: "0", onChange: handleChange }));
        const createNumericTextInput = (handleChange) => (React.createElement("input", { type: "text", onChange: handleChange, defaultValue: "1, 2, 3" }));
        const createTextInput = (handleChange, isArray) => (React.createElement("input", { type: "text", onChange: handleChange, defaultValue: isArray ? "Text, Text, Text" : "Text" }));
        const createGenericTextInput = (handleChange, defaultValue) => (React.createElement("input", { type: "text", onChange: handleChange, defaultValue: defaultValue }));
        for (const [prop, type] of Object.entries(propTypes)) {
            console.log("type", type);
            const { type: inputType, isArray } = getInputType(type);
            const input = (() => {
                switch (inputType) {
                    case "checkbox": {
                        const handleChange = (e) => {
                            setProps(Object.assign(Object.assign({}, props), { [prop]: e.target.checked }));
                        };
                        return createCheckboxInput(handleChange);
                    }
                    case "text": {
                        const handleChange = (e) => {
                            const value = isArray
                                ? e.target.value.split(",")
                                : e.target.value;
                            setProps(Object.assign(Object.assign({}, props), { [prop]: value }));
                        };
                        return createTextInput(handleChange, isArray);
                    }
                    case "number": {
                        const handleChange = (e) => {
                            const value = isArray
                                ? e.target.value.split(",").map(Number)
                                : Number(e.target.value);
                            setProps(Object.assign(Object.assign({}, props), { [prop]: value }));
                        };
                        if (isArray)
                            return createNumericTextInput(handleChange);
                        return createNumberInput(handleChange);
                    }
                    default: {
                        const handleChange = (e) => setProps(Object.assign(Object.assign({}, props), { [prop]: JSON.parse(e.target.value) }));
                        console.log(type);
                        return createGenericTextInput(handleChange, JSON.stringify(type));
                    }
                }
            })();
            inputs.push(React.createElement("div", { className: "looc-css-form" },
                React.createElement("label", null, prop),
                input));
        }
        return inputs;
    };
    useEffect(() => {
        {
            const loadComponent = async () => {
                const response = await fetch("data.json");
                const data = await response.json();
                return import(`/${data.filepath}`)
                    .then(({ default: component }) => {
                    console.log(`Successfully imported ${data.filepath}!`);
                    const propTypes = getPropTypesByComponent(component.name)(data.interfaces);
                    setPropTypes(propTypes);
                    setImports({ component });
                    setProps(setDefaultValues(propTypes));
                })
                    .catch((e) => console.log(`There was a problem importing ${data.filepath}!`, e));
            };
            loadComponent();
        }
    }, []);
    if (!imports)
        return null;
    const { component: Component } = imports;
    return (React.createElement(React.Fragment, null,
        React.createElement(Component, Object.assign({ __LOOC_DEBUG__: true }, props)),
        React.createElement("div", { className: "looc-css-container" }, createInputs(propTypes))));
};
const defaultDebugPropTypes = {
    isChecked1: "boolean",
    count1: "number",
    text1: "string",
    isChecked2: "boolean",
    count2: "number",
    text2: "string",
    isChecked3: "boolean",
    count3: "number",
    text3: "string",
    arr: ["number"],
    complex: {
        a: "number",
        b: "string",
    },
};
const defaultDebugProps = setDefaultValues(defaultDebugPropTypes);
const DebugComponent = (props) => {
    console.log("Debug props:", props);
    return (React.createElement("div", null,
        React.createElement("div", null,
            "isChecked1: ",
            props.isChecked1 ? "CHECKED" : "UNCHECKED"),
        React.createElement("div", null,
            "number1: ",
            props.count1),
        React.createElement("div", null,
            "text1: ",
            props.text1),
        React.createElement("div", null,
            "isChecked2: ",
            props.isChecked2 ? "CHECKED" : "UNCHECKED"),
        React.createElement("div", null,
            "number2: ",
            props.count2),
        React.createElement("div", null,
            "text2: ",
            props.text2),
        React.createElement("div", null,
            "isChecked3: ",
            props.isChecked3 ? "CHECKED" : "UNCHECKED"),
        React.createElement("div", null,
            "number3: ",
            props.count3),
        React.createElement("div", null,
            "text3: ",
            props.text3),
        React.createElement("div", null,
            "arr sum: ",
            props.arr.reduce((a, b) => a + b)),
        React.createElement("div", null,
            "complex a: ",
            props.complex.a),
        React.createElement("div", null,
            "complex b: ",
            props.complex.b)));
};
const debugLoaderProps = {
    debugComponent: {
        component: DebugComponent,
    },
    debugPropTypes: defaultDebugPropTypes,
    debugProps: defaultDebugProps,
};
ReactDOM.render(React.createElement(Loader, Object.assign({}, debugLoaderProps)), document.getElementById("root"));

export { Loader };
//# sourceMappingURL=looc-loader.js.map
