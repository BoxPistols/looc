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
        if (isStringLiteralUnion(type) || isNumberLiteralUnion(type)) {
            defaultProps[prop] = type[0];
            unions[prop] = type;
        }
        if (isInterface(type))
            defaultProps[prop] = setDefaultValues(type).props;
    }
    return { unions, props: defaultProps };
};
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
const isStringLiteralUnion = (t) => {
    return (Array.isArray(t) &&
        t.length > 1 &&
        typeof t[0] === "string" &&
        t[0] !== PrimitiveType.String &&
        t[0] !== PrimitiveType.Number);
};
const isStringUnion = (t) => {
    return Array.isArray(t) && t.length > 1 && t[0] === PrimitiveType.String;
};
const isNumberLiteralUnion = (t) => {
    return Array.isArray(t) && t.length > 1 && typeof t[0] === "number";
};
const isNumberUnion = (t) => {
    return Array.isArray(t) && t.length > 1 && t[0] === PrimitiveType.Number;
};
const isInterface = (t) => {
    return typeof t === "object" && t !== null && !Array.isArray(t);
};
const getPropTypesByComponent = (componentName) => (interfaces) => {
    const propTypes = `${componentName}Props`;
    return interfaces[propTypes];
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
const defaultDebugProps = setDefaultValues(defaultDebugPropTypes);

const Loader = ({ debugPropValues, debugPropTypes, debugComponent, }) => {
    const [imports, setImports] = useState(debugComponent || null);
    const [propTypes, setPropTypes] = useState(debugPropTypes || null);
    const [propValues, setPropValues] = useState(debugPropValues || null);
    const createInputs = (propTypes) => {
        const inputs = [];
        if (!propValues)
            return inputs;
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
            if (isNumberUnion(type) || isNumberLiteralUnion(type))
                return { type: "number", isUnion: true, isArray: false };
            if (isStringUnion(type) || isStringLiteralUnion(type))
                return { type: "text", isUnion: true, isArray: false };
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
                            setPropValues({
                                unions: propValues.unions,
                                props: Object.assign(Object.assign({}, propValues.props), { [prop]: e.target.checked }),
                            });
                        };
                        return createCheckboxInput(handleChange);
                    }
                    case "text": {
                        let handleChange;
                        if (isUnion) {
                            handleChange = (e) => {
                                const value = e.target.value;
                                setPropValues({
                                    unions: propValues.unions,
                                    props: Object.assign(Object.assign({}, propValues.props), { [prop]: value }),
                                });
                            };
                            return (React.createElement(TextField, { onChange: handleChange, select: true, value: propValues.props[prop], size: "small", variant: "outlined" }, propValues.unions[prop].map((opt) => (React.createElement(MenuItem, { key: opt, value: opt }, opt)))));
                        }
                        handleChange = (e) => {
                            const value = isArray
                                ? e.target.value.split(",")
                                : e.target.value;
                            setPropValues({
                                unions: propValues.unions,
                                props: Object.assign(Object.assign({}, propValues.props), { [prop]: value }),
                            });
                        };
                        return createTextInput(handleChange, isArray);
                    }
                    case "number": {
                        let handleChange;
                        if (isUnion) {
                            handleChange = (e) => {
                                const value = Number(e.target.value);
                                setPropValues({
                                    unions: propValues.unions,
                                    props: Object.assign(Object.assign({}, propValues.props), { [prop]: value }),
                                });
                            };
                            return (React.createElement(TextField, { onChange: handleChange, select: true, value: propValues.props[prop], size: "small", variant: "outlined" }, propValues.unions[prop].map((opt) => (React.createElement(MenuItem, { key: opt, value: opt }, opt)))));
                        }
                        if (isArray) {
                            handleChange = (e) => {
                                const value = e.target.value.split(",").map(Number);
                                setPropValues({
                                    unions: propValues.unions,
                                    props: Object.assign(Object.assign({}, propValues.props), { [prop]: value }),
                                });
                            };
                            return createNumericTextInput(handleChange);
                        }
                        handleChange = (e) => {
                            const value = Number(e.target.value);
                            setPropValues({
                                unions: propValues.unions,
                                props: Object.assign(Object.assign({}, propValues.props), { [prop]: value }),
                            });
                        };
                        return createNumberInput(handleChange);
                    }
                    default: {
                        const handleChange = (e) => setPropValues({
                            unions: propValues.unions,
                            props: Object.assign(Object.assign({}, propValues.props), { [prop]: JSON.parse(e.target.value) }),
                        });
                        return createGenericTextInput(handleChange, JSON.stringify(type));
                    }
                }
            })();
            inputs.push(React.createElement(Grid, { key: prop, alignItems: "center", justify: "space-between", item: true, container: true },
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
                    const propTypes = getPropTypesByComponent(component.name)(data.interfaces);
                    if (!propTypes) {
                        throw Error(`No props interfaces were found for ${component.name}! Make sure your interface ends with "Props"`);
                    }
                    setPropTypes(propTypes);
                    setImports({ component });
                    const propValues = setDefaultValues(propTypes);
                    setPropValues(propValues);
                })
                    .then(() => {
                    console.log(`Successfully imported ${data.filepath}!`);
                })
                    .catch((e) => {
                    console.error(`LOOC ERROR: There was a problem importing your component (path: ${data.filepath})!`);
                    console.error(`LOOC ERROR: ${e.message}`);
                });
            };
            loadComponent();
        }
    }, []);
    if (!imports)
        return null;
    if (!propValues)
        return null;
    const { component: Component } = imports;
    return (React.createElement(React.Fragment, null,
        React.createElement(Component, Object.assign({ __LOOC_DEBUG__: true }, propValues.props)),
        React.createElement(Box, { display: "inline-block", maxHeight: "30vh", boxSizing: "border-box", width: "100%", overflow: "scroll", "overflow-x": "hidden", position: "fixed", bottom: 0, bgcolor: "#faf8f7", p: 2 },
            React.createElement(Box, { width: "50%" },
                React.createElement(Grid, { direction: "column", container: true }, createInputs(propTypes))))));
};
{
    ReactDOM.render(React.createElement(Loader, null), document.getElementById("root"));
}

export { Loader };
//# sourceMappingURL=looc-loader.js.map
