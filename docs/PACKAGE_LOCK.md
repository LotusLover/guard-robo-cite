# package-lock.json 生成ガイド

このプロジェクトには `package-lock.json` が含まれていません。GitHub Actionsでのビルドを成功させるために、以下の手順に従ってください。

## 問題

```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
npm error Missing: firebase@11.10.0 from lock file
```

## 原因

- `package-lock.json` ファイルがリポジトリに含まれていない
- GitHub Actions が `npm ci` を使用しようとしている

## 解決方法

### 方法1: ローカルで package-lock.json を生成してコミット（推奨）

1. **ローカルでリポジトリをクローン**
   ```bash
   git clone https://github.com/LotusLover/guard-robo-cite.git
   cd guard-robo-cite
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```
   
   これにより `package-lock.json` が自動生成されます。

3. **生成されたファイルを確認**
   ```bash
   ls -la package-lock.json
   ```

4. **Git に追加してコミット**
   ```bash
   git add package-lock.json
   git commit -m "Add package-lock.json for reproducible builds"
   git push origin main
   ```

### 方法2: GitHub Actions で npm install を使用（既に適用済み）

`.github/workflows/deploy.yml` を以下のように変更:

```yaml
- name: Install dependencies
  run: npm install  # npm ci から変更
```

この変更により:
- `npm install` が package-lock.json を自動生成
- 依存関係が正しくインストールされる
- ビルドが成功する

## 確認方法

### ローカルでの確認

```bash
npm install
npm run build
```

期待される出力:
```
✓ built in 5.23s
dist/index.html                   0.45 kB
dist/assets/index-xxxxx.css      12.34 kB
dist/assets/index-xxxxx.js      123.45 kB
```

### GitHub Actions での確認

1. コードをプッシュ
2. GitHub の Actions タブを確認
3. ビルドが緑色のチェックマークで完了

## package-lock.json の重要性

### メリット
- ✅ 依存関係のバージョンを固定
- ✅ チーム全員が同じバージョンを使用
- ✅ 再現可能なビルド
- ✅ `npm ci` での高速インストール

### package-lock.json の役割
```json
{
  "name": "vite-vue-typescript-starter",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "dependencies": {
        "vue": "^3.5.22",
        "firebase": "^11.0.2"
      }
    },
    "node_modules/firebase": {
      "version": "11.0.2",
      "resolved": "https://registry.npmjs.org/firebase/-/firebase-11.0.2.tgz",
      "integrity": "sha512-...",
      "dependencies": {
        "@firebase/app": "0.13.2",
        // ... 全ての依存関係
      }
    }
  }
}
```

## トラブルシューティング

### エラー: npm install でもエラーが出る

```bash
# キャッシュをクリア
npm cache clean --force

# node_modules を削除
rm -rf node_modules

# 再インストール
npm install
```

### エラー: バージョンの競合

```bash
# package-lock.json を削除して再生成
rm package-lock.json
npm install
```

### GitHub Actions でまだエラーが出る

1. ワークフローファイルを確認
2. `npm ci` が `npm install` に変更されているか確認
3. Node.js のバージョンを確認（推奨: 20.x）

## ベストプラクティス

### DO ✅
- `package-lock.json` をGitにコミットする
- チーム全員で同じロックファイルを使用
- `npm ci` を CI/CD で使用（ロックファイルがある場合）
- 定期的に依存関係を更新

### DON'T ❌
- `package-lock.json` を `.gitignore` に追加しない
- ロックファイルを手動編集しない
- 異なるパッケージマネージャーを混在させない

## 次のステップ

1. ローカルで `npm install` を実行
2. `package-lock.json` が生成されたことを確認
3. Git にコミット＆プッシュ
4. GitHub Actions が成功することを確認

---

**注意**: package-lock.json は約 20,000 行になる可能性があります。これは正常です。全ての依存関係のバージョンと整合性ハッシュが含まれています。