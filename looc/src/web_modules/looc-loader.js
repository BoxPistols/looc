import React, { useState, useEffect } from './react.js';
import ReactDOM from './react-dom.js';

var ArrayType;
(function (ArrayType) {
    ArrayType["String"] = "string[]";
    ArrayType["Number"] = "number[]";
    ArrayType["Boolean"] = "boolean[]";
    ArrayType["Nothing"] = "nothing";
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
const isObject = (t) => {
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
        if (isObject(type))
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
                return "number";
            if (isBoolean(type))
                return "checkbox";
            if (isString(type))
                return "text";
            return "text";
        };
        const createCheckboxInput = (handleChange) => (React.createElement("input", { type: "checkbox", defaultChecked: false, onChange: handleChange }));
        const createNumberInput = (handleChange) => (React.createElement("input", { type: "number", defaultValue: "0", onChange: handleChange }));
        const createTextInput = (handleChange) => (React.createElement("input", { onChange: handleChange, defaultValue: "Text" }));
        for (const [prop, type] of Object.entries(propTypes)) {
            const inputType = getInputType(type);
            const input = (() => {
                switch (inputType) {
                    case "checkbox": {
                        const handleChange = (e) => {
                            setProps(Object.assign(Object.assign({}, props), { [prop]: e.target.checked }));
                        };
                        return createCheckboxInput(handleChange);
                    }
                    case "text": {
                        const handleChange = (e) => setProps(Object.assign(Object.assign({}, props), { [prop]: e.target.value }));
                        return createTextInput(handleChange);
                    }
                    case "number": {
                        const handleChange = (e) => setProps(Object.assign(Object.assign({}, props), { [prop]: e.target.value }));
                        return createNumberInput(handleChange);
                    }
                    default: {
                        const handleChange = (e) => setProps(Object.assign(Object.assign({}, props), { [prop]: e.target.value }));
                        return createTextInput(handleChange);
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
            props.text3)));
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
