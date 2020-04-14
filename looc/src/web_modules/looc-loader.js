import React, { useState, useEffect } from './react.js';
import ReactDOM from './react-dom.js';
import { Box, Grid, TextField, MenuItem, Checkbox } from './@material-ui/core.js';

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
    return Array.isArray(t) && t.length === 1 && t[0] === PrimitiveType.String;
};
const isNumberArray = (t) => {
    return Array.isArray(t) && t.length === 1 && t[0] === PrimitiveType.Number;
};
const isBoolArray = (t) => {
    return Array.isArray(t) && t.length === 1 && t[0] === PrimitiveType.Boolean;
};
const isStringUnion = (t) => {
    return Array.isArray(t) && t.length === 2 && t[0] === PrimitiveType.String;
};
const isNumberUnion = (t) => {
    return Array.isArray(t) && t.length === 2 && t[0] === PrimitiveType.Number;
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
    const unions = {};
    for (const [prop, type] of Object.entries(propTypes)) {
        if (isNumber(type))
            defaultProps[prop] = 0;
        if (isBoolean(type))
            defaultProps[prop] = false;
        if (isString(type))
            defaultProps[prop] = "Text";
        if (isNumberArray(type))
            defaultProps[prop] = [1, 2, 3];
        if (isStringArray(type))
            defaultProps[prop] = ["Text", "Text", "Text"];
        if (isBoolArray(type))
            defaultProps[prop] = [true, true, true];
        if (isStringUnion(type)) {
            defaultProps[prop] = "Variant1";
            unions[prop] = ["Variant1", "Variant2"];
        }
        if (isNumberUnion(type)) {
            defaultProps[prop] = 0;
            unions[prop] = [0, 1];
        }
        if (isInterface(type))
            defaultProps[prop] = setDefaultValues(type).defaultProps;
    }
    return { unions, defaultProps };
};
const Loader = ({ debugProps, debugPropTypes, debugComponent, debugUnions, }) => {
    const [imports, setImports] = useState(debugComponent || null);
    const [propTypes, setPropTypes] = useState(debugPropTypes || null);
    const [props, setProps] = useState(debugProps || {});
    const [unions, setUnions] = useState(debugUnions || {});
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
            if (isNumberUnion(type))
                return { type: "number", isUnion: true, isArray: false };
            if (isStringUnion(type))
                return { type: "string", isUnion: true, isArray: false };
            return { type: "unknown", isArray: false };
        };
        const createCheckboxInput = (handleChange) => (React.createElement(Checkbox, { defaultChecked: false, onChange: handleChange }));
        const createNumberInput = (handleChange) => (React.createElement(TextField, { type: "number", defaultValue: "0", size: "small", variant: "outlined", onChange: handleChange }));
        const createNumericTextInput = (handleChange) => (React.createElement(TextField, { type: "text", onChange: handleChange, size: "small", variant: "outlined", defaultValue: "1, 2, 3" }));
        const createTextInput = (handleChange, isArray) => (React.createElement(TextField, { type: "text", onChange: handleChange, size: "small", variant: "outlined", defaultValue: isArray ? "Text, Text, Text" : "Text" }));
        const createGenericTextInput = (handleChange, defaultValue) => (React.createElement(TextField, { type: "text", onChange: handleChange, size: "small", variant: "outlined", defaultValue: defaultValue }));
        for (const [prop, type] of Object.entries(propTypes)) {
            const { type: inputType, isArray, isUnion } = getInputType(type);
            const input = (() => {
                switch (inputType) {
                    case "checkbox": {
                        const handleChange = (e) => {
                            setProps(Object.assign(Object.assign({}, props), { [prop]: e.target.checked }));
                        };
                        return createCheckboxInput(handleChange);
                    }
                    case "text": {
                        let handleChange;
                        if (isUnion) {
                            handleChange = (e) => {
                                const value = e.target.value;
                                setProps(Object.assign(Object.assign({}, props), { [prop]: value }));
                            };
                            return (React.createElement(TextField, { onChange: handleChange, select: true, value: props[prop], size: "small", variant: "outlined" }, unions[prop].map((opt) => (React.createElement(MenuItem, { value: opt }, opt)))));
                        }
                        handleChange = (e) => {
                            const value = isArray
                                ? e.target.value.split(",")
                                : e.target.value;
                            setProps(Object.assign(Object.assign({}, props), { [prop]: value }));
                        };
                        return createTextInput(handleChange, isArray);
                    }
                    case "number": {
                        let handleChange;
                        if (isUnion) {
                            handleChange = (e) => {
                                const value = Number(e.target.value);
                                setProps(Object.assign(Object.assign({}, props), { [prop]: value }));
                            };
                            return (React.createElement(TextField, { onChange: handleChange, select: true, value: props[prop], size: "small", variant: "outlined" }, unions[prop].map((opt) => (React.createElement(MenuItem, { value: opt }, opt)))));
                        }
                        if (isArray) {
                            handleChange = (e) => {
                                const value = e.target.value.split(",").map(Number);
                                setProps(Object.assign(Object.assign({}, props), { [prop]: value }));
                            };
                            return createNumericTextInput(handleChange);
                        }
                        handleChange = (e) => {
                            const value = Number(e.target.value);
                            setProps(Object.assign(Object.assign({}, props), { [prop]: value }));
                        };
                        return createNumberInput(handleChange);
                    }
                    default: {
                        const handleChange = (e) => setProps(Object.assign(Object.assign({}, props), { [prop]: JSON.parse(e.target.value) }));
                        return createGenericTextInput(handleChange, JSON.stringify(type));
                    }
                }
            })();
            inputs.push(React.createElement(Grid, { alignItems: "center", justify: "space-between", item: true, container: true },
                React.createElement(Grid, { item: true },
                    React.createElement(Box, { fontWeight: "fontWeightBold", fontFamily: "Monospace", m: 2 }, prop)),
                React.createElement(Grid, { item: true }, input)));
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
                    const { unions, defaultProps } = setDefaultValues(propTypes);
                    setProps(defaultProps);
                    setUnions(unions);
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
        React.createElement(Box, { display: "inline-block", maxHeight: "30vh", boxSizing: "border-box", width: "100%", overflow: "scroll", "overflow-x": "hidden", position: "fixed", bottom: 0, bgcolor: "#faf8f7", p: 2 },
            React.createElement(Box, { width: "50%" },
                React.createElement(Grid, { direction: "column", container: true }, createInputs(propTypes))))));
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
    choice: ["number", "number"],
    complex: {
        a: "number",
        b: "string",
    },
};
const { defaultProps: defaultDebugProps, unions } = setDefaultValues(defaultDebugPropTypes);
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
            "choice: ",
            props.choice),
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
    debugUnions: unions,
};
ReactDOM.render(React.createElement(Loader, Object.assign({}, debugLoaderProps)), document.getElementById("root"));

export { Loader };
//# sourceMappingURL=looc-loader.js.map
