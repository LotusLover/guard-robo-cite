# 🔒 Firebase セキュリティガイド

警備ロボット監視システムのFirebase Realtime Databaseセキュリティ設定について説明します。

## 📋 セキュリティルール概要

このプロジェクトでは2つのセキュリティルール設定を提供しています：

### 1. `database.rules.json` - 基本セキュリティルール

```json
{
  "rules": {
    ".read": true,
    ".write": false,
    "robots": {
      ".read": true,
      ".write": "auth != null && auth.token.admin === true"
    },
    "alerts": {
      ".read": true,
      ".write": "auth != null && (auth.token.admin === true || auth.token.robot === true)"
    }
  }
}
```

**特徴:**
- ✅ 読み込み: 全て許可（監視システムの性質上、誰でも状況確認可能）
- ⚠️ 書き込み: 認証済みユーザーのみ
- 🤖 ロボットからのアラート投稿: 専用トークンで許可

### 2. `database.rules.public.json` - 厳格セキュリティルール

```json
{
  "rules": {
    ".read": true,
    ".write": false,
    "alerts": {
      ".read": true,
      ".write": false,
      // データ構造検証あり
    }
  }
}
```

**特徴:**
- ✅ 読み込み: 全て許可
- 🚫 書き込み: 完全に禁止
- ✅ データ検証: 厳格な型・値チェック
- 🛡️ 最高レベルのセキュリティ

## 🚀 推奨設定パターン

### パターン1: 開発・デモ環境（推奨）
```json
// database.rules.public.json を使用
{
  "rules": {
    ".read": true,
    ".write": false
  }
}
```

**メリット:**
- セキュリティリスクゼロ
- 誤操作による データ破損防止
- GitHub Pagesでの公開に最適

**デメリット:**
- データ更新はFirebaseコンソールからのみ

### パターン2: 本格運用環境
```json
// database.rules.json + Firebase Authentication
{
  "rules": {
    ".read": true,
    "alerts": {
      ".write": "auth != null && auth.token.robot === true"
    }
  }
}
```

**メリット:**
- リアルタイムなロボットからの投稿
- 適切なアクセス制御

**デメリット:**
- 認証システムの構築が必要

## 🔐 セキュリティベストプラクティス

### 1. 読み込み権限の設計思想
```javascript
// 警備システムの特性を考慮
".read": true // 👍 透明性のある監視システム
```

**理由:**
- 警備状況は関係者全員が確認できるべき
- 緊急時の迅速な状況把握
- GitHub Pagesでの無認証アクセス対応

### 2. 書き込み権限の段階的制御
```javascript
// レベル1: 完全禁止（最安全）
".write": false

// レベル2: 管理者のみ
".write": "auth != null && auth.token.admin === true"

// レベル3: ロボット + 管理者
".write": "auth != null && (auth.token.admin === true || auth.token.robot === true)"
```

### 3. データ検証ルール
```javascript
"timestamp": {
  ".validate": "newData.isNumber() && newData.val() <= now"
},
"severity": {
  ".validate": "newData.isString() && newData.val().matches(/^(low|medium|high|critical)$/)"
}
```

## 🛠️ 設定手順

### ステップ1: Firebaseプロジェクト作成
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. Realtime Database を有効化

### ステップ2: セキュリティルール設定
1. Firebase Console > Realtime Database > ルール
2. 提供されたルールファイルの内容をコピペ
3. 「公開」ボタンでルールを適用

### ステップ3: 設定ファイル更新
```typescript
// src/firebase.ts
const firebaseConfig = {
  apiKey: "実際のAPIキー",
  authDomain: "プロジェクト名.firebaseapp.com",
  databaseURL: "https://プロジェクト名-default-rtdb.firebaseio.com/",
  projectId: "プロジェクト名",
  // ... 他の設定
}
```

## ⚠️ セキュリティ注意事項

### 避けるべき設定
```javascript
// 🚫 危険: 誰でも書き込み可能
{
  "rules": {
    ".read": true,
    ".write": true  // 絶対にダメ！
  }
}
```

### 環境変数の使用
```javascript
// 🔒 本番環境では必須
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
}
```

## 📊 監視・ログ

Firebase Console で以下を定期的に確認:
- アクセスログ
- 使用量統計
- セキュリティ違反の試行
- 異常なデータアクセスパターン

## 🆘 緊急時対応

### データ漏洩が疑われる場合
1. Firebase Console でルールを即座に更新
2. `.write": false` で書き込みを完全停止
3. アクセスログの詳細確認
4. 必要に応じてプロジェクトを一時停止

### 不正アクセス検知時
1. 該当IPアドレスのブロック
2. Authentication設定の見直し
3. カスタムクレームの再設定

---

このガイドに従って、安全で実用的な警備ロボット監視システムを運用してください。