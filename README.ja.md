[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Looc とは何か?

Looc は、React コンポーネントをすぐに個別にブラウザーで確認するためのツールです。Looc を使うと、コンポーネントを"サンドボックス化"して　 props も操作できるので、表示がどう更新されるかを確認できます。小さい修正ごとに大きいプロジェクトを時間をかけて再ビルドしなくてもすむので、コンポーネントのテストに非常に役に立ちます。一度に一つのコンポーネントしか見ない、自動的な[knobs addon](https://github.com/storybookjs/storybook/tree/master/addons/knobs)を入れた Storybook のようなものだと考えてもいいです。トランスパイルや外部ライブラリのバンドルが不要になるブラウザーの ES モジュール対応に頼るので、コンポーネントを**ゼロ**に近い時間で確認できます。

## 条件

Storybook と比べて、Looc を使うには、追加で一行もコードを書く必要はないが、いくつかの条件を満たさなければならない：

1. Typescript を使う. `.tsx`ファイルしか対応できないです. その理由は _仕組み_ セクションに書いてあります

2. その`.tsx` ファイルの中に`xxxProps` という**interface** があり、コンポーネントの名前が`xxx` になっています. 例えば、コンポーネントの名前は `Card`だとすれば, `CardProps`という**interface**が必要です. もちろん、あなたのコンポーネントが props を必要としないなら、**interface**も必要ないです

3. コンポーネントが **default** として **export** されています

4. `npx`コマンドが使えます（内部の処理用）

## 使用

### インストール

```bash
$ npm install looc --save-dev
# OR
$ yarn add looc -D
```

### スタート

`looc start`で、開発サーバーを立ち上げます：

```bash
$ yarn looc start src/component.tsx
# OR
$ npx looc start src/component.tsx
```

### Look

`localhost:3000`でコンポーネントを確認します：
<br>
<br>

<p align="center"><img src="./assets/looc.gif" /></p>

## CLI コマンド

### `start <filepath>`

`filepath`は、確認したいコンポーネントがあるファイルへのパスです。`filepath`はカレントディレクトリの相対パスでなければならない

フラグ:

- `--css` :　コンポーネントが`.css` ファイルをインポートする場合に使う

```javascript
import "styles.css";
```

- `--css-modules` : コンポーネントが CSS モジュールを利用する場合に使う

```javascript
import styles from "styles.css";
```

- `--emotion` :コンポーネントのスタイルに [emotion](https://github.com/emotion-js/emotion)を使う場合に使う

* `--styled-components` : :コンポーネントのスタイルに [styled-components](https://github.com/styled-components/styled-components)を使う場合に使う

- `--without-props`:　コンポーネントが props を必要としない場合に使う

* `--clean`: ビルド時にキャッシュを削除する

## How it works

`.tsx`ファイルを解析し、interface を抽出するために、Looc は内部で[tsx-ray](https://github.com/jlkiri/tsx-ray) を使います。あなたのコンポーネントにどの型のどの props を渡すことができるか分かるためにその情報を使います。

次は, [emotion](https://github.com/emotion-js/emotion) や [styled-components](https://github.com/styled-components/styled-components)のようなライブラリを使う場合, Looc は [snowpack](https://github.com/pikapkg/snowpack) でそのライブラリの ESM 版をダウンロードし、ブラウザーから直接インポートできるようにします. それが`npx`が必要な理由: 内部で`snowpack`を `npx`で起動します.

このアプローチでは、ビルド・再ビルド時間をほぼゼロにできます（他コンポーネントのインポートとバンドルや、Typescript のトランスパイルは避けられないので完全にゼロにはできない）。初期のライブラリのインストールは 1 分ぐらい、少し時間がかかりますが、次回以降の起動は数秒しかかからないです。大きなプロジェクトで Storybook 使った場合と比べて、非常に速いです。トランスパイルとバンドルリングは [rollup](https://github.com/rollup/rollup)でします。

コンポーネントがロードされたら、ブラウザーで確認できます。Looc は props 操作用に簡単な UI を自動的に生成します（上記の GIF にある）。その UI は、props の型をもとに作られます。そして、どの props がオプショナルかわからないので、全ての props のデフォルトの値も型によって決めます。

どの型に対してどの `<input>` が生成されるかは以下の通り：

- `string`: `<input type="text">`
- `number`: `<input type="number">`
- `string[]`: `<input type="text">`
- `number[]`: `<input type="text">`
- `boolean`: `<input type="checkbox">`

Union (特にリテラル型の union) 型は はきれいに `<select>`になります.例えば `"round" | "squared"` 型に対して `round` と `squared`をオプションとして持つ`<select>`が生成されます.

### FAQ

- **Q**: グローバルな CSS が使えるか?
  **A**: コンポーネントがグローバルな CSS に頼る場合, その CSS ファイルを直接インポートしないかぎり、スタイルが適用されないです。

* **Q**: `emotion` と `styled-components`以外の外部ライブラリが使えるか?
  **A**: 現時点では、Looc が許容するライブラリ以外の外部ライブラリに依存する場合は、そのライブラリが使えないです（バンドルされないからです）

- **Q**: 配列型はどう扱われるか？
  **A**: prop が配列型の場合、生成された`<input>`の値が自動的に `,`で`split`されます。そうすることで、一つの input で複数の値を入力できます。`number`配列の場合は、各値が`Number`で変換されます.

* **Q**: 外部ライブラリに依存するけど、テストに関係ないロジックがある。コンポーネントがサンドボックス内にあるかどうかはどう分かるのか？
  **A**: ロードされたコンポーネントには `boolean` 型の `__LOOC_DEBUG__` プロップが渡されます。`looc start`でロードしたならそれがいつも`true`になります。`__LOOC_DEBUG__`を条件的に使えば、不要なロジックの実行を防止できます。

- **Q**: `No interfaces found!` エラーが発生する！
  **A**:あなたのコンポーネントが props を必要としない可能性があります。interface を探さなくてもいいことを Looc に教えるには`--without-props` フラグを使ってください.

## Contribution

このプロジェクトは Yarn 2 と PnP (plug-n-play)を使っています. 全ての依存しているライブラリはリポジトリに入っています.コードは全て Typescript です. Looc はモノリポジトリです。

どんどん issue を立ててください！

### 構造

- `looc`: CLI 用のコードが置いてあるワークスペース

* `looc-e2e`: リアルワールドのコンポーネントで`looc`をテストするためだけのワークスペース

- `looc-loader`: `Loader`, ユーザーのコンポーネントをロードし操作できるようにする React コンポーネント用のコードが置いてあるワークスペース

### 開発

1. このリポジトリを fork する
2. ローカルに clone する
3. 修正をする
4. `yarn build`でビルドが成功することを確認する (Yarn 2 の warning は無視してもいい)
5. `yarn e2e:start`で`looc`がリアルワールドのコードで使えることを確認する
