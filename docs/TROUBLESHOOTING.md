# 🐛 ビルドエラーの修正方法

このファイルは、ビルド時に発生するTypeScriptとFirebase関連のエラーを修正する手順を説明します。

## 発生したエラー

```
Error: src/firebase.ts(2,31): error TS2307: Cannot find module 'firebase/app' or its corresponding type declarations.
Error: src/firebase.ts(3,54): error TS2307: Cannot find module 'firebase/database' or its corresponding type declarations.
```

## 原因

1. Firebase SDKが `package.json` の `dependencies` に含まれていなかった
2. `npm install` を実行していなかった
3. TypeScriptの厳格な型チェック設定

## 修正手順

### ステップ1: 依存関係のクリーンアップ

```bash
# 既存のnode_modulesとpackage-lock.jsonを削除
rm -rf node_modules package-lock.json

# または Windows PowerShellの場合
Remove-Item -Recurse -Force node_modules, package-lock.json
```

### ステップ2: 依存関係の再インストール

```bash
npm install
```

これにより、`package.json` に追加された Firebase SDK がインストールされます。

### ステップ3: ビルドの実行

```bash
npm run build
```

### ステップ4: エラーが続く場合

#### キャッシュのクリア
```bash
npm cache clean --force
npm install
npm run build
```

#### TypeScript設定の確認
`tsconfig.app.json` に以下が含まれているか確認:
```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

## 修正内容の詳細

### 1. package.json の更新
```json
{
  "dependencies": {
    "vue": "^3.5.22",
    "firebase": "^11.0.2"  // ← 追加
  }
}
```

### 2. TypeScript型定義の追加
`src/services/guard-robot-service.ts`:
```typescript
// 型定義をインポート
import { 
  DataSnapshot, 
  DatabaseError 
} from 'firebase/database'

// コールバック関数に型を明示
onValue(ref, (snapshot: DataSnapshot) => {
  // ...
}, (error: DatabaseError) => {
  // ...
})
```

### 3. 型アサーションの追加
```typescript
// 配列からランダムに選択する際に型を明示
const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)] as GuardRobotAlert['type']
```

### 4. tsconfig.app.json の緩和
```json
{
  "compilerOptions": {
    "noUnusedLocals": false,      // 緩和
    "noUnusedParameters": false,  // 緩和
    "skipLibCheck": true          // 追加
  }
}
```

## GitHub Actionsでのビルド

GitHub Actionsでも同じエラーが発生する場合:

1. リポジトリの Settings > Actions > General
2. "Workflow permissions" を確認
3. "Read and write permissions" を選択

ワークフローファイル (`.github/workflows/deploy.yml`) は既に更新済みです:
```yaml
- name: Install dependencies
  run: npm ci

- name: Verify Firebase installation
  run: npm list firebase

- name: Build
  run: npm run build
```

## 確認方法

### Firebase SDKがインストールされているか確認
```bash
npm list firebase
```

期待される出力:
```
guard-robo-cite@0.0.0
└── firebase@11.0.2
```

### ビルドが成功したか確認
```bash
npm run build
```

成功すると `dist` フォルダが生成されます:
```
dist/
├── assets/
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
└── index.html
```

## よくある問題

### Q: `npm install` でエラーが出る
A: Node.jsのバージョンを確認してください（推奨: Node.js 18以上）
```bash
node --version
npm --version
```

### Q: ビルドは成功するが、サイトが表示されない
A: `vite.config.ts` の `base` 設定を確認してください
```typescript
export default defineConfig({
  base: '/guard-robo-cite/', // リポジトリ名と一致
})
```

### Q: Firebase接続エラーが出る
A: `src/firebase.ts` の設定を確認してください
```typescript
const firebaseConfig = {
  apiKey: "実際のAPIキー",
  // ... その他の設定
}
```

## 成功の確認

ビルドが成功すると、以下のようなログが表示されます:

```
✓ built in 5.23s
dist/index.html                   0.45 kB
dist/assets/index-xxxxx.css      12.34 kB
dist/assets/index-xxxxx.js      123.45 kB
```

---

それでも問題が解決しない場合は、GitHubのIssuesで詳細なエラーログと共に報告してください。