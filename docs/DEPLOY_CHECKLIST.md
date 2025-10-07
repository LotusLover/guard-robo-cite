# ✅ デプロイ準備チェックリスト

警備ロボット監視システムをGitHub Pagesにデプロイする前の最終確認リストです。

## 📋 デプロイ前の確認事項

### 1. ✅ 依存関係の確認
- [x] `package.json` に Firebase SDK が含まれている (`firebase: ^11.0.2`)
- [x] `package.json` に gh-pages が含まれている (`gh-pages: ^6.2.0`)
- [ ] **`package-lock.json` がリポジトリにコミットされている（重要！）**
- [x] TypeScript の型定義エラーが解決されている
- [x] ビルドスクリプトが正しく設定されている

### 2. ✅ Firebase設定
- [x] `src/firebase.ts` に実際のFirebase設定が記載されている
  ```typescript
  apiKey: "AIzaSyCdQJqWZ8S5FLW9R5QW3VABgU86O89Eggk"
  projectId: "guard-robo-back"
  databaseURL: "https://guard-robo-back-default-rtdb.firebaseio.com"
  ```
- [ ] Firebase Console でセキュリティルールを設定
- [ ] Realtime Database が有効化されている

### 3. ✅ ビルド設定
- [x] `vite.config.ts` の `base` パスが正しい (`/guard-robo-cite/`)
- [x] `tsconfig.app.json` に `skipLibCheck: true` が含まれている
- [x] TypeScript型エラーが全て解決されている

### 4. ✅ GitHub設定
- [ ] リポジトリの Settings > Pages > Source を "GitHub Actions" に設定
- [ ] `.github/workflows/deploy.yml` が存在する
- [ ] GitHub Actions の Workflow permissions が有効

### 5. ✅ セキュリティ
- [x] セキュリティルールファイルが作成されている
  - `database.rules.json` (認証ベース)
  - `database.rules.public.json` (読み取り専用・推奨)
- [ ] Firebase Console でセキュリティルールを適用
- [x] `.gitignore` に `.env` が含まれている

## 🚀 デプロイ手順

### ステップ1: ローカルでの最終確認

```bash
# 依存関係のインストール（package-lock.json を生成）
npm install

# package-lock.json が生成されたことを確認
ls -la package-lock.json

# package-lock.json をコミット（初回のみ）
git add package-lock.json
git commit -m "Add package-lock.json for reproducible builds"
git push origin main

# ビルドテスト
npm run build

# プレビュー
npm run preview
```

⚠️ **重要**: `package-lock.json` がないとGitHub Actionsでのビルドが失敗します！
詳細は [PACKAGE_LOCK.md](PACKAGE_LOCK.md) を参照してください。

### ステップ2: Firebase セキュリティルール設定

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト "guard-robo-back" を選択
3. Realtime Database > ルール タブを開く
4. `database.rules.public.json` の内容をコピペ（推奨）:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": false
     }
   }
   ```
5. 「公開」ボタンをクリック

### ステップ3: GitHub Pages設定

1. GitHubリポジトリにアクセス
2. Settings > Pages を開く
3. Source を "GitHub Actions" に設定
4. Settings > Actions > General を開く
5. Workflow permissions を "Read and write permissions" に設定

### ステップ4: デプロイ実行

#### 方法A: GitHub Actionsで自動デプロイ（推奨）

```bash
git add .
git commit -m "🚀 Deploy guard robot monitoring system"
git push origin main
```

GitHub Actionsが自動的に:
1. 依存関係をインストール
2. TypeScriptをコンパイル
3. Viteでビルド
4. GitHub Pagesにデプロイ

#### 方法B: 手動デプロイ

```bash
npm run deploy
```

### ステップ5: デプロイ確認

1. GitHub の Actions タブで進行状況を確認
2. 緑色のチェックマークが表示されたら成功
3. 以下のURLでアクセス:
   ```
   https://[username].github.io/guard-robo-cite/
   ```

## 🔍 デプロイ後の確認

### 必須チェック項目

- [ ] サイトが正しく表示される
- [ ] ヘッダーに「警備ロボット監視システム」が表示される
- [ ] ロボット状態カードが表示される
- [ ] アラート履歴が表示される
- [ ] ネットワーク接続状態が表示される

### 機能チェック

- [ ] Firebase Realtime Databaseに接続できる
- [ ] リアルタイムデータが更新される
- [ ] オンライン/オフライン状態が正しく表示される
- [ ] ブラウザのコンソールにエラーがない

### レスポンシブチェック

- [ ] PC（デスクトップ）で正しく表示される
- [ ] タブレットで正しく表示される
- [ ] スマートフォンで正しく表示される
- [ ] 画面サイズに応じてレイアウトが変わる

## ❌ トラブルシューティング

### ビルドエラーが出る

```bash
# キャッシュをクリア
rm -rf node_modules package-lock.json
npm install
npm run build
```

### GitHub Actionsが失敗する

1. Actions タブでエラーログを確認
2. Node.js のバージョンを確認（推奨: 20.x）
3. Workflow permissions を確認

### サイトが404エラー

1. `vite.config.ts` の `base` パスを確認
2. リポジトリ名と一致しているか確認
3. GitHub Pages の Source 設定を確認

### Firebase接続エラー

1. ブラウザのコンソールを確認
2. `src/firebase.ts` の設定を確認
3. Firebase セキュリティルールを確認
4. ネットワーク接続を確認

## 📊 期待される結果

### ビルド成功ログ

```
✓ built in 5.23s
dist/index.html                   0.45 kB
dist/assets/index-xxxxx.css      12.34 kB
dist/assets/index-xxxxx.js      123.45 kB
```

### GitHub Actions成功ログ

```
✅ Checkout
✅ Setup Node.js
✅ Install dependencies
✅ Verify Firebase installation
✅ Build
✅ Deploy to GitHub Pages
```

### Firebase接続ログ（ブラウザコンソール）

```
🚀 GuardRobotMonitor コンポーネントを初期化中...
🔄 Firebase接続とダミーデータの初期化を開始...
✅ Firebase接続成功
🔗 Firebase Realtime Database に接続されました
📡 アラートデータを受信: 4件
🤖 ロボットデータを受信: 3台
✅ ダミーデータの初期化が完了しました
```

## 🎉 デプロイ完了！

全てのチェック項目にチェックが入ったら、デプロイ完了です！

公開URL: `https://[username].github.io/guard-robo-cite/`

---

**注意事項:**
- 初回デプロイには5-10分かかる場合があります
- Firebase無料枠の制限に注意してください
- セキュリティルールは必ず設定してください（書き込み制限推奨）
- データは定期的にバックアップしてください

**サポート:**
問題が発生した場合は、[TROUBLESHOOTING.md](TROUBLESHOOTING.md) を参照するか、GitHubのIssuesで報告してください。