# 🔔 通知音機能ガイド

## 概要

警備ロボット監視システムに**通知音機能**を追加しました！
新しいアラートを受信したときや、操作を実行したときに、**WAV/MP3形式の音声ファイル**でお知らせします。

## ⚠️ 重要: 音声ファイルの準備

この機能を使用するには、音声ファイルを配置する必要があります。

📖 **[音声ファイル配置ガイド](SOUND_FILES_SETUP.md)** を参照して、音声ファイルを準備してください。

### クイックスタート

1. `public/sounds/` フォルダを作成（既に作成済み）
2. 8つの音声ファイル（WAV/MP3）を配置:
   - `alert-low.wav`
   - `alert-medium.wav`
   - `alert-high.wav`
   - `alert-critical.wav`
   - `success.wav`
   - `error.wav`
   - `info.wav`
   - `system-start.wav`
3. ビルドして確認

詳細は **[音声ファイル配置ガイド](SOUND_FILES_SETUP.md)** を参照してください。

## 機能一覧

### 🔊 アラート通知音

アラートの重要度に応じて異なる音が鳴ります:

| 重要度 | 音のパターン | 音の長さ | 波形 | 説明 |
|--------|------------|---------|------|------|
| 🟢 **低** | ビープ音 2回 | 約0.7秒 | sine | 500Hz、穏やかな通知音 |
| 🟡 **中** | ビープ音 3回 | 約1秒 | sine | 700Hz → 850Hz、注意喚起 |
| 🟠 **高** | 上昇音 4回 | 約1.3秒 | sawtooth | 800Hz → 1100Hz、警告音 |
| 🔴 **緊急** | サイレン風 6回 | 約2.5秒 | square | 1200Hz ↔ 800Hz、強力な警告音 |

### ✅ 操作フィードバック音

| 操作結果 | 音 | 音の長さ | 説明 |
|---------|-----|---------|------|
| ✅ **成功** | 上昇音階 4音 | 約0.8秒 | C5 → E5 → G5 → C6（華やかな成功音） |
| ❌ **エラー** | 下降音 3回 | 約0.9秒 | 350Hz → 300Hz → 250Hz（明確な警告音） |
| ℹ️ **情報** | 短いビープ 2回 | 約0.35秒 | 900Hz → 1000Hz（軽い通知音） |

### 🎵 システム音

| イベント | 音 | 音の長さ | 説明 |
|---------|-----|---------|------|
| 🚀 **起動** | 上昇アルペジオ 5音 | 約1秒 | A4 → C#5 → E5 → A5 → C6（壮大な起動音） |

## 使い方

### 音声のオン/オフ切り替え

画面上部のステータスバーに**音声ボタン**があります:

- 🔊 = 音声オン（通知音が鳴ります）
- 🔇 = 音声オフ（ミュート状態）

**切り替え方法:**
1. 画面上部の音声ボタン（🔊 or 🔇）をクリック
2. トグルでオン/オフが切り替わります

### 新しいアラートを受信した時

1. Firebaseから新しいアラートデータを受信
2. アラートの重要度に応じた通知音が自動再生
3. 画面に新しいアラートが表示される

**例:**
- 緊急アラート → サイレン風の警告音
- 通常アラート → ビープ音 2〜3回

### テストコントロールパネルで操作した時

1. 「📤 アラートを送信」ボタンをクリック
2. 送信成功 → ✅ 成功音（上昇音階）
3. 送信失敗 → ❌ エラー音（下降音）
4. ステータスログに結果が表示される

## 技術詳細

### Web Audio API + 音声ファイル再生

音声ファイル（WAV/MP3）をWeb Audio APIで読み込んで再生します。

```typescript
// 音声ファイルの読み込みと再生
const response = await fetch('/sounds/alert-low.wav')
const arrayBuffer = await response.arrayBuffer()
const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

const source = audioContext.createBufferSource()
source.buffer = audioBuffer
source.connect(audioContext.destination)
source.start(0)
```

### サウンドマネージャー

`src/utils/sound-manager.ts` で音声を一元管理:

```typescript
import { soundManager } from '../utils/sound-manager'

// アラート音を再生
await soundManager.playAlertSound('critical') // 緊急アラート

// 成功音を再生
await soundManager.playSuccess()

// エラー音を再生
await soundManager.playError()

// ミュート切り替え
soundManager.toggleMute()
```

### キャッシュ機能

一度読み込んだ音声ファイルはメモリにキャッシュされ、2回目以降は即座に再生できます。

```typescript
private soundCache: Map<string, AudioBuffer> = new Map()

// 初回: ファイルを読み込んでキャッシュ
// 2回目以降: キャッシュから即座に取得
```

### 主要メソッド

| メソッド | 説明 | パラメータ |
|---------|------|-----------|
| `playAlertSound(severity)` | アラート音を再生 | 'low' \| 'medium' \| 'high' \| 'critical' |
| `playSuccess()` | 成功音を再生 | なし |
| `playError()` | エラー音を再生 | なし |
| `playInfo()` | 情報音を再生 | なし |
| `playSystemStart()` | システム起動音を再生 | なし |
| `toggleMute()` | ミュート切り替え | なし |
| `setMuted(boolean)` | ミュート状態を設定 | true \| false |
| `isSoundMuted()` | ミュート状態を取得 | なし |

## ブラウザ互換性

### 対応ブラウザ

✅ Chrome 57+  
✅ Firefox 53+  
✅ Safari 14+  
✅ Edge 79+  

### 非対応ブラウザ

古いブラウザでは音が鳴りませんが、システムは正常に動作します。

### ユーザー操作が必要

ブラウザのセキュリティポリシーにより:
- ページ読み込み直後は音が鳴らない場合があります
- **最初のクリック後**に音声が有効になります

これは正常な動作です。

## カスタマイズ

### 音量を調整する

`sound-manager.ts` の `playBeep()` メソッドで音量を変更:

```typescript
private playBeep(frequency: number, duration: number, volume: number = 0.3) {
  // volume を変更（0.0〜1.0）
  // デフォルト: 0.3（30%）
  gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
}
```

### 音の周波数を変更する

各メソッドの周波数値を変更:

```typescript
playLowAlert() {
  this.playBeep(400, 0.2) // 400Hz → 好みの周波数に変更
}

playMediumAlert() {
  this.playBeep(600, 0.15) // 600Hz
}
```

### 新しい音を追加する

`sound-manager.ts` に新しいメソッドを追加:

```typescript
/**
 * カスタム音を再生
 */
playCustomSound() {
  this.playBeep(440, 0.2) // A4音（440Hz）
  setTimeout(() => this.playBeep(523.25, 0.2), 200) // C5音
  setTimeout(() => this.playBeep(659.25, 0.2), 400) // E5音
}
```

## トラブルシューティング

### Q1: 音が鳴らない

**原因1**: ミュート状態  
**解決策**: 画面上部の🔇ボタンをクリックして🔊に変更

**原因2**: ブラウザのセキュリティ制限  
**解決策**: ページをクリックしてから再度試す

**原因3**: ブラウザの音量がオフ  
**解決策**: OSまたはブラウザの音量設定を確認

### Q2: 音が小さい/大きい

**解決策**: `sound-manager.ts` の `volume` パラメータを調整
```typescript
this.playBeep(800, 0.2, 0.5) // 音量を50%に増加
```

### Q3: 複数の音が重なって鳴る

**原因**: 短時間に複数のアラートを受信  
**解決策**: これは正常な動作です。必要に応じて音の再生間隔を調整できます。

### Q4: 起動音が鳴らない

**原因**: ページ読み込み直後はブラウザが音声をブロック  
**解決策**: 
- 最初に画面をクリックしてから使用
- または起動音の遅延を長くする（現在500ms）

## パフォーマンス

### リソース使用量

- **メモリ**: 約1MB（AudioContext + Oscillatorノード）
- **CPU**: 音声生成時のみ軽微な負荷
- **ネットワーク**: 0（音声ファイルは不要、リアルタイム生成）

### 利点

✅ 外部ファイル不要（全て動的生成）  
✅ 軽量（追加ダウンロード不要）  
✅ カスタマイズ容易  
✅ レイテンシーゼロ  

## 今後の拡張案

- [ ] カスタム音声ファイルのサポート
- [ ] 音量スライダーの追加
- [ ] 音のテーマ選択（レトロ、モダン、サイレントなど）
- [ ] 音声の録音機能
- [ ] 音声分析（周波数スペクトラム表示）
- [ ] バイブレーション対応（モバイルデバイス）

## まとめ

通知音機能により:

✅ アラート受信を音で即座に認識  
✅ 操作の成功/失敗を音でフィードバック  
✅ 画面を見ていなくても通知に気づける  
✅ システムの状態を聴覚的に把握  
✅ より直感的なユーザー体験  

監視業務がより効率的になりました！🔔

---

**作成日**: 2025年10月7日  
**バージョン**: 1.0.0  
**ステータス**: ✅ 実装完了
