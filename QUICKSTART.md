# ⚡ クイックスタートガイド

警備ロボット監視システムを最速でデプロイする手順です。

## 🚀 5分でデプロイ

### ステップ1: リポジトリのセットアップ（1分）

```bash
# リポジトリをクローン
git clone https://github.com/LotusLover/guard-robo-cite.git
cd guard-robo-cite

# 依存関係をインストール
npm install
```

### ステップ2: package-lock.json をコミット（1分）

```bash
# package-lock.json をコミット
git add package-lock.json
git commit -m "Add package-lock.json"
git push origin main
```

⚠️ **これが最重要！** package-lock.json がないとGitHub Actionsが失敗します。

### ステップ3: Firebase セキュリティルール設定（2分）

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクト "guard-robo-back" を選択
3. Realtime Database > ルール タブ
4. 以下をコピペ:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": false
     }
   }
   ```
5. 「公開」をクリック

### ステップ4: GitHub Pages 有効化（1分）

1. GitHubリポジトリの Settings > Pages
2. Source: "GitHub Actions" を選択
3. Settings > Actions > General
4. Workflow permissions: "Read and write permissions" を選択

### 完了！

GitHub Actionsが自動的にビルド・デプロイを開始します。
5-10分後に以下のURLでアクセス可能:

```
https://[username].github.io/guard-robo-cite/
```

## ❌ エラーが出た場合

### エラー: "Missing: firebase@... from lock file"

**原因**: package-lock.json がコミットされていない

**解決**:
```bash
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push origin main
```

### エラー: "Cannot find module 'firebase/app'"

**原因**: 依存関係が正しくインストールされていない

**解決**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### エラー: "404 Not Found"

**原因**: GitHub Pages の設定が間違っている

**解決**:
1. Settings > Pages で Source が "GitHub Actions" になっているか確認
2. `vite.config.ts` の `base` がリポジトリ名と一致しているか確認

## 📊 成功の確認

### GitHub Actions
1. リポジトリの "Actions" タブを開く
2. 最新のワークフローをクリック
3. 全てが緑色のチェックマークならOK

### サイト確認
1. `https://[username].github.io/guard-robo-cite/` にアクセス
2. 「警備ロボット監視システム」が表示される
3. ロボット状態カードが表示される
4. アラート履歴が表示される

## 📚 詳細情報

- [完全なセットアップ手順](README.md)
- [ビルド手順](docs/BUILD.md)
- [トラブルシューティング](docs/TROUBLESHOOTING.md)
- [デプロイチェックリスト](docs/DEPLOY_CHECKLIST.md)
- [package-lock.json ガイド](docs/PACKAGE_LOCK.md)
- [セキュリティガイド](docs/SECURITY.md)

---

**ヒント**: 初回は必ず `npm install` → `package-lock.json をコミット` の順で実行してください！