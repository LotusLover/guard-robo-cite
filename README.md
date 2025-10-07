# 🤖 警備ロボット監視システム

警備ロボットから送信される情報をリアルタイムで監視するWebアプリケーションです。

📖 **[⚡ クイックスタート（5分でデプロイ）](QUICKSTART.md)**

## 📋 概要

- 警備ロボットの状態監視（オンライン状況、バッテリーレベル、最終通信時間）
- アラート管理（動体検知、音声検知、侵入検知、システムエラー等）
- リアルタイム通信（Firebase Realtime Database使用）
- レスポンシブデザイン（スマートフォン・PC対応）
- GitHub Pagesでのデプロイ

## 🛠️ 技術スタック

- **フロントエンド**: Vue 3 + TypeScript + Vite
- **データベース**: Firebase Realtime Database
- **デプロイ**: GitHub Pages
- **スタイリング**: CSS3 (レスポンシブデザイン)

## 🚀 開発環境のセットアップ

⚠️ **重要**: 初回セットアップ時は必ず以下の手順を実行してください。

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/LotusLover/guard-robo-cite.git
   cd guard-robo-cite
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```
   
   ⚠️ **重要**: このコマンドにより `package-lock.json` が生成されます。
   このファイルは必ずGitにコミットしてください。

3. **package-lock.json をコミット（初回のみ）**
   ```bash
   git add package-lock.json
   git commit -m "Add package-lock.json"
   git push origin main
   ```

4. **Firebase設定**
   - `src/firebase.ts` でFirebaseプロジェクトの設定を更新
   - 実際のFirebase設定情報を入力（既に設定済み）

5. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

6. **ビルド**
   ```bash
   npm run build
   ```
   
   詳細は [ビルド手順](docs/BUILD.md) を参照してください。

## 📱 機能

### ロボット状態監視
- 各ロボットのオンライン/オフライン状況
- バッテリーレベルの監視
- 最終通信時間の表示
- 位置情報の確認

### アラート管理
- 動体検知アラート
- 音声検知アラート
- 侵入検知アラート
- システムエラーアラート
- アラートの重要度分類（低・中・高・緊急）
- アラート状態管理（アクティブ・確認済み・解決済み）

### リアルタイム更新
- Firebase Realtime Databaseによるリアルタイム通信
- 自動的なデータ更新
- 新しいアラートの即座の表示

## 🌐 デプロイ

### GitHub Pagesへの自動デプロイ
1. GitHubリポジトリにプッシュ
2. GitHub Actionsが自動でビルド・デプロイを実行
3. `https://[username].github.io/guard-robo-cite/` でアクセス可能

### 手動デプロイ
```bash
npm run deploy
```

## 📁 プロジェクト構造

```
src/
├── components/
│   └── GuardRobotMonitor.vue  # メインの監視画面コンポーネント
├── services/
│   └── guard-robot-service.ts # Firebase通信とデータ管理
├── types/
│   └── guard-robot.ts         # TypeScript型定義
├── firebase.ts                # Firebase設定
├── App.vue                    # ルートコンポーネント
└── main.ts                    # エントリーポイント
```

## 🔧 カスタマイズ

### Firebase設定の更新
1. Firebaseプロジェクトを作成
2. Realtime Databaseを有効化
3. `src/firebase.ts` の設定を更新

### セキュリティルールの設定
プロジェクトでは2つのセキュリティルール設定を提供：

1. **開発・デモ用** (`database.rules.public.json`)
   ```json
   {
     "rules": {
       ".read": true,
       ".write": false
     }
   }
   ```
   - 読み込み自由、書き込み禁止
   - 最も安全な設定
   - GitHub Pages公開に最適

2. **本格運用用** (`database.rules.json`)
   ```json
   {
     "rules": {
       ".read": true,
       ".write": "auth != null && auth.token.admin === true"
     }
   }
   ```
   - 認証済みユーザーのみ書き込み可能
   - リアルタイム更新対応

詳細は [セキュリティガイド](docs/SECURITY.md) をご確認ください。

### ダミーデータの変更
`src/services/guard-robot-service.ts` の `initializeDummyData()` メソッドでダミーデータを編集できます。

### UI・デザインの変更
`src/components/GuardRobotMonitor.vue` のスタイルセクションでデザインをカスタマイズできます。

## 🤝 貢献

1. フォークする
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

問題や質問がある場合は、GitHubのIssuesページでお知らせください。