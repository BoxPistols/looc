[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[日本語](./README.ja.md)

## What is Looc?

Looc is a tool that allows you to quickly preview your React components in the browser independently from other existing components. With Looc you can "sandbox" the component and manipulate its props and immediately see how it reacts to updates. This is very useful for testing components without having to rebuild the whole project on every single change. You can think of it as a fast alternative to Storybook with the [knobs addon](https://github.com/storybookjs/storybook/tree/master/addons/knobs) enabled automatically but for single components. Looc can build your component in almost **zero** time: it relies on native support for ESM modules in the browser, so there is no need to transpile and bundle external libraries.

## Who should use it?

Anyone who does not like to wait too much and needs the combined functionality of Storybook's "knobs" and React Dev Tools with little to no cost.

## Usage

### Install

```bash
$ npm install looc --save-dev
# OR
$ yarn add looc -D
```

### Start

Use the `looc start` command to start the live server that serves your sandboxed component:

```bash
$ yarn looc start src/component.tsx
# OR
$ npx looc start src/component.tsx
```

### Look

Now you can see and manipulate your component at `localhost:3000`:
<br>
<br>

<p align="center"><img src="./assets/looc.gif" /></p>

## Requirements

While you don't need to write _any_ additional code to use Looc, you need to make sure that:

1. You use Typescript. It only works on `.tsx` files. To understand why see the _How it works_ section below.

2. There is an **interface** inside the `.tsx` file that is named `xxxProps` where `xxx` is the name of your component. If your component is named `Card`, then you need an interface named `CardProps`. If your component does not have props, then you can skip this requirement.

3. Your component is a default export.

4. `npx` command should be available (for internal use).

## CLI commands

### `start <filepath>`

The `filepath` must be relative to current working directory.

Flags:

- `--css` : Use if your component imports `.css` files.

```javascript
import "styles.css";
```

- `--css-modules` : Use if you rely on CSS modules.

```javascript
import styles from "styles.css";
```

- `--emotion` : Use if you style your components with [emotion](https://github.com/emotion-js/emotion).

* `--styled-components` : Use if you style your components with [styled-components](https://github.com/styled-components/styled-components).

- `--without-props`: Use this if you components does not need props.

* `--clean`: Remove the cache during the build.

## How it works

Suppose you have a file `IDCard.tsx` and inside it is a component that looks like this:

```typescript
interface IDCardProps {
  firstName: string;
  lastName: string;
  title: string;
  id: number;
  picShape: "squared" | "round";
  telephone: string;
}

const IDCard: React.FC<IDCardProps> = ({
  firstName = "",
  lastName = "",
  title = "",
  id = 0,
  telephone = "",
  picShape = "round",
}) => {
  /* your components code */
};

export default IDCard;
```

Looc will parse the interface and wrap your component in a special component that knows the props and their types. This allows Looc to automatically generate input UI and pass values to your component accordingly!

Internally, Looc uses [tsx-ray](https://github.com/jlkiri/tsx-ray) to parse the `.tsx` file and extract interfaces from it. This information is used to decide which props can be passed to your component and what type they should be.

Next, if you use libraries like [emotion](https://github.com/emotion-js/emotion) or [styled-com ponents](https://github.com/styled-components/styled-components), Looc uses [snowpack](https://github.com/pikapkg/snowpack) to download ESM versions of those libraries so it can import them directly from browser. This is why Looc needs `npx`: because `snowpack` is started with `npx`.

This approach allows to reduce the build-rebuild time to almost zero (_almost_, because Looc still needs to resolve and bundle imports of other components and because Typescript needs to be compiled). Initial installation of required libraries can take some time: usually less than a minute. Subsequent starts might take only a few seconds. It is **very** fast compared to how much you need to wait if you use Storybook and your project is big. Looc uses [rollup](https://github.com/rollup/rollup) to do the compilation and bundling.

When your component is loaded, you can confirm it in the browser window. Looc provides a simple UI for manipulating props which you can see in the GIF above. The UI is generated automatically based on prop types. Since there is no way to know which props are required and which aren't, default values are set for every single prop based on its type.

Here's a brief explanation of which `<input>` is generated based for which prop type:

- `string`: `<input type="text">`
- `number`: `<input type="number">`
- `string[]`: `<input type="text">`
- `number[]`: `<input type="text">`
- `boolean`: `<input type="checkbox">`

Union types (especially literals) map very nicely to a `<select>`. For example a `"round" | "squared"` type is generated as a `<select>` with options `round` and `squared`.

### FAQ

- **Q**: Does it support object type props?
  **A**: It does set default values so your components does not crash, but there is no input for objects. If you do need object props though, the text input is generated anyway, with a string representation of the object, which you can modify and it will be `JSON.parse`d.

- **Q**: Can I use global CSS styles?
  **A**: If your component relies on some global CSS, then the styles will not apply unless the CSS file is imported directy into the file with component.

* **Q**: Can I use external libraries other than `emotion` and `styled-components`?
  **A**: If your component relies on external libraries other than those allowed by Looc, currently they won't be bundled.

- **Q**: How are array types treated?
  **A**: If prop type is an array then the value in the generated `<input>` is automatically split by `,`, which allows you to input multiple values with a single input. If a number array is required than input values are automatically converted with `Number`.

* **Q**: I have some logic that relies on external libraries but that is not crucial for visual testing. How do I detect that my component is in a sandbox and prevent this logic from applying?
  **A**: A loaded component is provided with a special `boolean` prop `__LOOC_DEBUG__` which is always `true` if your component is loaded with `looc start`. You can use it to conditionally prevent any logic from applying.

- **Q**: I get the `No interfaces found!` error.
  **A**: It could be that your components does not need props at all. To tell Looc that it does not need to look for interfaces you need a `--without-props` flag.

## Contribution

This project uses Yarn 2 and its PnP feature (plug-n-play). All dependencies are kept inside the repository. The code is written entirely in Typescript. Looc project is a monorepo.

Feel free to open an issue!

### Structure

- `looc`: This workspace contains the code for CLI.

* `looc-e2e`: This workspace is used only to test the CLI on real world components.

- `looc-loader`: This workspace is the code for the `Loader`, a React component that is used to import and manipulate user's components.

### Develop

1. Fork this repository
2. Clone your fork to work on it locally
3. Make changes
4. Run `yarn build` and make sure that it builds without crash (there will be Yarn 2 specific warnings that can be ignored)
5. Run `yarn e2e:start` to make sure real code works with `looc`
