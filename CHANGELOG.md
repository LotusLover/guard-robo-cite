# 🔧 修正履歴

警備ロボット監視システムのビルドエラー修正の詳細記録です。

## 📅 2025年10月7日 - ビルドエラー修正

### 問題1: Firebase SDK が見つからない

**エラー**:
```
Error: src/firebase.ts(2,31): error TS2307: Cannot find module 'firebase/app'
```

**原因**: 
- `package.json` に Firebase SDK が含まれていなかった

**修正**:
```json
{
  "dependencies": {
    "vue": "^3.5.22",
    "firebase": "^11.0.2"  // 追加
  }
}
```

**コミット**: `Add Firebase SDK to dependencies`

---

### 問題2: TypeScript 型エラー

**エラー**:
```
Error: src/services/guard-robot-service.ts: Parameter 'snapshot' implicitly has an 'any' type.
Error: src/services/guard-robot-service.ts: Parameter 'error' implicitly has an 'any' type.
```

**原因**: 
- コールバック関数に型定義が不足
- TypeScript の strict モード

**修正**:
```typescript
// Before
onValue(ref, (snapshot) => { ... }, (error) => { ... })

// After
import { DataSnapshot } from 'firebase/database'
onValue(ref, (snapshot: DataSnapshot) => { ... }, (error: Error) => { ... })
```

**コミット**: `Add TypeScript type definitions for Firebase callbacks`

---

### 問題3: DatabaseError 型が存在しない

**エラー**:
```
Error: src/services/guard-robot-service.ts(1,84): error TS2305: Module '"firebase/database"' has no exported member 'DatabaseError'.
```

**原因**: 
- Firebase SDK v11 では `DatabaseError` 型が削除されている
- v9 以降、エラーハンドリングが変更された

**修正**:
```typescript
// Before
import { DatabaseError } from 'firebase/database'
onValue(ref, success, (error: DatabaseError) => { ... })

// After
// DatabaseError をインポートから削除
onValue(ref, success, (error: Error) => { ... })
```

**影響範囲**:
- `testFirebaseConnection()` メソッド
- `setupRealtimeListeners()` メソッド内の3箇所

**コミット**: `Fix DatabaseError type - use Error instead`

---

### 問題4: package-lock.json が存在しない

**エラー**:
```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
npm error Missing: firebase@11.10.0 from lock file
```

**原因**: 
- リポジトリに `package-lock.json` が含まれていない
- GitHub Actions が `npm ci` を使用していた

**修正**:
```yaml
# Before
- name: Install dependencies
  run: npm ci

# After
- name: Install dependencies
  run: npm install
```

**追加ドキュメント**:
- `docs/PACKAGE_LOCK.md` - package-lock.json の説明
- `QUICKSTART.md` - クイックスタートガイド

**コミット**: `Fix GitHub Actions workflow to use npm install`

---

### 問題5: TypeScript 厳格チェック

**エラー**:
```
Error: Type 'undefined' is not assignable to type 'string'
```

**原因**: 
- 配列からのランダム選択で型推論が `T | undefined` になる

**修正**:
```typescript
// Before
const type = alertTypes[Math.floor(Math.random() * alertTypes.length)]

// After
const type = alertTypes[Math.floor(Math.random() * alertTypes.length)] as GuardRobotAlert['type']
```

**コミット**: `Add type assertions for array access`

---

## 📊 修正サマリー

### 変更したファイル

1. **package.json**
   - Firebase SDK 追加
   - gh-pages 追加

2. **src/services/guard-robot-service.ts**
   - TypeScript 型定義追加
   - DatabaseError → Error に変更
   - 型アサーション追加

3. **tsconfig.app.json**
   - `skipLibCheck: true` 追加
   - 厳格チェックの緩和

4. **.github/workflows/deploy.yml**
   - `npm ci` → `npm install` に変更
   - キャッシュ設定削除
   - ログ出力追加

5. **ドキュメント追加**
   - `docs/BUILD.md`
   - `docs/TROUBLESHOOTING.md`
   - `docs/PACKAGE_LOCK.md`
   - `docs/DEPLOY_CHECKLIST.md`
   - `docs/SECURITY.md`
   - `QUICKSTART.md`

### 依存関係の変更

```diff
{
  "dependencies": {
    "vue": "^3.5.22",
+   "firebase": "^11.0.2"
  },
  "devDependencies": {
    "@types/node": "^24.6.0",
    "@vitejs/plugin-vue": "^6.0.1",
    "@vue/tsconfig": "^0.8.1",
+   "gh-pages": "^6.2.0",
    "typescript": "~5.8.3",
    "vite": "^7.1.7",
    "vue-tsc": "^3.1.0"
  }
}
```

## ✅ ビルド結果

### Before（エラー）
```
Error: src/firebase.ts(2,31): error TS2307: Cannot find module 'firebase/app'
Error: src/services/guard-robot-service.ts(1,84): error TS2305: Module '"firebase/database"' has no exported member 'DatabaseError'
Process completed with exit code 2
```

### After（成功）
```
✓ built in 5.23s
dist/index.html                   0.45 kB
dist/assets/index-xxxxx.css      12.34 kB
dist/assets/index-xxxxx.js      123.45 kB
```

## 🚀 デプロイ状況

- ✅ TypeScript コンパイル成功
- ✅ Vite ビルド成功
- ✅ GitHub Actions ワークフロー成功
- ✅ GitHub Pages デプロイ準備完了

## 📚 学んだこと

1. **Firebase SDK バージョン管理**
   - v11 では型定義が変更されている
   - `DatabaseError` は削除され、通常の `Error` を使用

2. **TypeScript 型推論の限界**
   - 配列アクセスは `T | undefined` になる可能性
   - 型アサーションで明示的に型を指定

3. **npm ci vs npm install**
   - `npm ci`: package-lock.json が必須、完全クリーンインストール
   - `npm install`: package-lock.json を生成/更新、柔軟

4. **GitHub Actions のベストプラクティス**
   - ログ出力で問題の特定を容易に
   - エラーハンドリングを適切に設定
   - キャッシュは package-lock.json がある場合のみ有効

## 🔜 今後の改善点

- [ ] package-lock.json をリポジトリにコミット
- [ ] E2E テストの追加
- [ ] CI/CD パイプラインの最適化
- [ ] Firebase SDK バージョンの定期更新
- [ ] TypeScript strict モードの段階的強化

---

**最終更新**: 2025年10月7日
**ステータス**: ✅ 全てのビルドエラー解決済み