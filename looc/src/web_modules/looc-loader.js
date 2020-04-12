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
const getPropTypesByComponent = (componentName) => (interfaces) => {
    const propTypes = `${componentName}Props`;
    return interfaces[propTypes];
};

const Loader = () => {
    const [imports, setImports] = useState(null);
    const [propTypes, setPropTypes] = useState(null);
    const [props, setProps] = useState({});
    console.log("HELLO");
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
        for (const [prop, type] of Object.entries(propTypes)) {
            inputs.push(React.createElement("label", { className: "prop-input" },
                prop,
                ":",
                React.createElement("input", { type: getInputType(type), onChange: (e) => {
                        const newProps = Object.assign(Object.assign({}, props), { [prop]: e.target.value });
                        setProps(newProps);
                    } })));
        }
        return inputs;
    };
    useEffect(() => {
        if (!__DEBUG__) {
            const loadComponent = async () => {
                const response = await fetch("data.json");
                const data = await response.json();
                return import(`/${data.filepath}`)
                    .then(({ default: component }) => {
                    console.log(`Successfully imported ${data.filepath}!`);
                    const propTypes = getPropTypesByComponent(component.name)(data.interfaces);
                    console.log("Prop types: ", propTypes);
                    setPropTypes(propTypes);
                    setImports({ component });
                })
                    .catch((e) => console.log(`There was a problem importing ${data.filepath}!`, e));
            };
            loadComponent();
        }
    }, []);
    if (__DEBUG__)
        return React.createElement("div", null, "Debug");
    if (!imports)
        return null;
    const { component: Component } = imports;
    return (React.createElement("div", null,
        React.createElement(Component, Object.assign({}, props)),
        React.createElement("div", { className: "prop-inputs" }, createInputs(propTypes))));
};
ReactDOM.render(React.createElement(Loader, null), document.getElementById("root"));

export { Loader };
//# sourceMappingURL=looc-loader.js.map
