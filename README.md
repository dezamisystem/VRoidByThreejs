# Three.js VRM + VRMA Viewer

## 概要

Three.js と @pixiv/three-vrm を使用した、ブラウザ上で VRM モデルと VMA アニメーションを表示するプロジェクト。

## 機能

### VRM モデルの読み込み

`@pixiv/three-vrm`による`.vrm` ファイルを表示

### VRMA アニメーション

`@pixiv/three-vrm-animation`による`.vrma` ファイルのアニメーションを適用

### アニメーション制御

`lil-gui` パネルによる制御

- 一時停止 (Pause) / 再開（Resume）
- タイムスライダーによるアニメーションのシーク

### カメラ操作

`OrbitControls` による回転、移動、ズーム

## モジュールインストール

```bash
$ npm i -D webpack webpack-cli typescript ts-loader
$ npm i -S three @pixiv/three-vrm
$ npm i -S @pixiv/three-vrm-animation
```

## 起動方法

```bash
npm run dev
```

ブラウザで `http://localhost:5173` (またはコンソールに表示されるURL) にアクセス

## Tech Stack

- [Three.js](https://threejs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)
- [lil-gui](https://lil-gui.georgealways.com/)
- [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)

## License

MIT

---

©️2026 DEZAMISYSTEM
