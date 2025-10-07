# ビルドとデプロイ手順

## 📦 初回セットアップ

1. **依存関係のインストール**
   ```bash
   npm install
   ```
   
   これにより以下がインストールされます:
   - Vue 3
   - Firebase SDK
   - TypeScript
   - Vite
   - その他の開発ツール

## 🔨 ビルド

### ローカルビルド
```bash
npm run build
```

ビルドが成功すると、`dist` フォルダに静的ファイルが生成されます。

### ビルドエラーが出た場合

**エラー: "Cannot find module 'firebase/app'"**
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
npm run build
```

**TypeScript型エラーが出た場合**
- `tsconfig.app.json` で `skipLibCheck: true` が設定されているか確認
- Firebase SDKが正しくインストールされているか確認:
  ```bash
  npm list firebase
  ```

## 🚀 デプロイ

### GitHub Pagesへのデプロイ

#### 方法1: GitHub Actionsで自動デプロイ（推奨）

1. GitHubリポジトリの Settings > Pages で以下を設定:
   - Source: `GitHub Actions`
   
2. コードをmainブランチにプッシュ:
   ```bash
   git add .
   git commit -m "Deploy guard robot monitoring system"
   git push origin main
   ```

3. GitHub Actionsが自動的にビルド・デプロイを実行

4. デプロイ完了後、以下のURLでアクセス可能:
   ```
   https://[username].github.io/guard-robo-cite/
   ```

#### 方法2: 手動デプロイ

```bash
npm run deploy
```

このコマンドは以下を実行します:
1. `npm run build` でビルド
2. `gh-pages -d dist` で dist フォルダを gh-pages ブランチにデプロイ

## 🔧 トラブルシューティング

### ビルドエラー: Module not found

```bash
# キャッシュをクリア
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### GitHub Actionsのエラー

1. `.github/workflows/deploy.yml` が正しく配置されているか確認
2. GitHub Settings > Actions > General で "Workflow permissions" を確認
3. "Read and write permissions" にチェックが入っているか確認

### Firebase接続エラー

- `src/firebase.ts` の設定が正しいか確認
- Firebase Console でプロジェクトが有効か確認
- セキュリティルールが設定されているか確認

## 📱 プレビュー

### ローカルプレビュー
```bash
npm run preview
```

ビルドされたアプリケーションをローカルでプレビューできます。

### 開発サーバー
```bash
npm run dev
```

開発モードで起動し、ホットリロードが有効になります。

## 🔐 環境変数（オプション）

本番環境でFirebase設定を隠したい場合:

1. `.env.example` を `.env` にコピー
2. `.env` ファイルに実際の値を入力
3. `src/firebase.ts` を環境変数を使用するように変更

**注意**: `.env` ファイルはGitにコミットしないでください！

## 📊 ビルドサイズの最適化

```bash
# ビルドサイズを分析
npm run build -- --mode=analyze
```

チャンク分割は `vite.config.ts` で設定されています:
- `vue`: Vue.js コア
- `firebase`: Firebase SDK

## ✅ デプロイ前チェックリスト

- [ ] `npm install` で依存関係をインストール
- [ ] `npm run build` でビルドが成功
- [ ] `src/firebase.ts` の設定を確認
- [ ] Firebase セキュリティルールを設定
- [ ] `vite.config.ts` の `base` パスを確認
- [ ] `.gitignore` に `.env` が含まれているか確認

## 🎉 デプロイ成功後

デプロイが成功したら、以下を確認:
1. サイトが正しく表示されるか
2. Firebase Realtime Databaseに接続できるか
3. レスポンシブデザインが機能しているか（スマホ・PCで確認）
4. ブラウザのコンソールにエラーがないか

---

問題が解決しない場合は、GitHubのIssuesで報告してください。