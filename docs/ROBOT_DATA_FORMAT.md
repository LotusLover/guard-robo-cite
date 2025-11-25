# ロボット警備システム - データ送信フォーマット仕様書

## 概要
このドキュメントは、警備ロボットからFirebase Realtime Databaseにデータを送信する際の仕様を説明します。

## 目次
1. [接続情報](#接続情報)
2. [データ形式](#データ形式)
3. [送信エンドポイント](#送信エンドポイント)
4. [サンプルコード](#サンプルコード)

---

## 接続情報

### Firebase Realtime Database URL
```
https://[YOUR-PROJECT-ID].firebaseio.com/
```

### データパス
- **アラート送信**: `/alerts`

### 認証
**現在、アラート送信に認証は不要です。**直接データを送信できます。

---

## データ形式

### 1. アラートデータ (`GuardRobotAlert`)

アラートは異常検知時に送信します。

#### JSON構造
```json
{
  "id": "alert_20231120_001",
  "timestamp": 1700465400000,
  "type": "motion",
  "severity": "high",
  "location": "Building-A Floor-1 Room-101",
  "description": "不審な動きを検知しました",
  "status": "active"
}
```

#### フィールド説明

| フィールド | 型 | 必須 | 説明 | 有効な値 |
|-----------|-----|------|------|----------|
| `id` | string | ✅ | 一意のアラートID | 任意の文字列（推奨: `alert_[日付]_[連番]`） |
| `timestamp` | number | ✅ | UNIXタイムスタンプ（ミリ秒） | Epoch時刻（例: 1700465400000） |
| `type` | string | ✅ | アラートの種類 | `motion`, `sound`, `breach`, `system` |
| `severity` | string | ✅ | 重要度 | `low`, `medium`, `high`, `critical` |
| `location` | string | ✅ | 検知場所 | 任意の文字列 |
| `description` | string | ✅ | アラートの詳細説明 | 任意の文字列 |
| `status` | string | ✅ | 状態 | `active`, `acknowledged`, `resolved` |

#### アラートタイプの詳細

- **`motion`**: 動体検知
- **`sound`**: 音響検知
- **`breach`**: 侵入検知
- **`system`**: システムエラー・異常

#### 重要度レベルの目安

- **`low`**: 軽微な異常（定期確認で対応可能）
- **`medium`**: 注意が必要な異常（30分以内に確認推奨）
- **`high`**: 重要な異常（即時確認が必要）
- **`critical`**: 緊急対応が必要な異常（即座に対応）

---

### 2. ロボット状態データ (`GuardRobotStatus`)

ロボットの稼働状態を定期的に送信します（推奨: 30秒〜1分間隔）。

#### JSON構造
```json
{
  "id": "robot_001",
  "name": "警備ロボットα",
  "location": "Building-A Floor-1",
  "isOnline": true,
  "batteryLevel": 85,
  "lastHeartbeat": 1700465400000
}
```

#### フィールド説明

| フィールド | 型 | 必須 | 説明 | 有効な値 |
|-----------|-----|------|------|----------|
| `id` | string | ✅ | ロボットの一意ID | 任意の文字列（例: `robot_001`） |
| `name` | string | ✅ | ロボットの名前 | 任意の文字列 |
| `location` | string | ✅ | 現在地 | 任意の文字列 |
| `isOnline` | boolean | ✅ | オンライン状態 | `true` または `false` |
| `batteryLevel` | number | ✅ | バッテリー残量 | 0〜100（パーセント） |
| `lastHeartbeat` | number | ✅ | 最終通信時刻 | UNIXタイムスタンプ（ミリ秒） |

---

## 送信エンドポイント

### REST API方式

#### アラートの送信

```http
POST https://[YOUR-PROJECT-ID].firebaseio.com/alerts.json
Content-Type: application/json

{
  "id": "alert_20231120_001",
  "timestamp": 1700465400000,
  "type": "motion",
  "severity": "high",
  "location": "Building-A Floor-1 Room-101",
  "description": "不審な動きを検知しました",
  "status": "active"
}
```

**注意**: 
- 認証トークンは不要です
- アラートは `POST` で新規追加されます

---

## サンプルコード

### Python

```python
import requests
import time
import json

# 設定
FIREBASE_URL = "https://[YOUR-PROJECT-ID].firebaseio.com"
ROBOT_ID = "robot_001"

def send_alert(alert_type, severity, location, description):
    """アラートを送信"""
    alert_data = {
        "id": f"alert_{int(time.time())}",
        "timestamp": int(time.time() * 1000),
        "type": alert_type,
        "severity": severity,
        "location": location,
        "description": description,
        "status": "active"
    }
    
    url = f"{FIREBASE_URL}/alerts.json"
    response = requests.post(url, json=alert_data)
    
    if response.status_code == 200:
        print(f"✅ アラート送信成功: {alert_data['id']}")
    else:
        print(f"❌ アラート送信失敗: {response.status_code} - {response.text}")
    
    return response

# 使用例
if __name__ == "__main__":
    # アラート送信の例
    send_alert(
        alert_type="motion",
        severity="high",
        location="Building-A Floor-1 Room-101",
        description="不審な動きを検知しました"
    )
```

### cURL

```bash
# アラート送信
curl -X POST \
  "https://[YOUR-PROJECT-ID].firebaseio.com/alerts.json" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "alert_20231120_001",
    "timestamp": 1700465400000,
    "type": "motion",
    "severity": "high",
    "location": "Building-A Floor-1 Room-101",
    "description": "不審な動きを検知しました",
    "status": "active"
  }'
```

### Node.js

```javascript
const axios = require('axios');

const FIREBASE_URL = 'https://[YOUR-PROJECT-ID].firebaseio.com';
const ROBOT_ID = 'robot_001';

// アラート送信
async function sendAlert(type, severity, location, description) {
  const alertData = {
    id: `alert_${Date.now()}`,
    timestamp: Date.now(),
    type,
    severity,
    location,
    description,
    status: 'active'
  };
  
  try {
    const response = await axios.post(
      `${FIREBASE_URL}/alerts.json`,
      alertData
    );
    console.log('✅ アラート送信成功:', alertData.id);
    return response.data;
  } catch (error) {
    console.error('❌ アラート送信失敗:', error.message);
    throw error;
  }
}

// 使用例
(async () => {
  // アラート送信
  await sendAlert(
    'motion',
    'high',
    'Building-A Floor-1 Room-101',
    '不審な動きを検知しました'
  );
})();
```

---

## ベストプラクティス

### 1. アラートの送信タイミング
- 異常検知時は**即座に**送信
- 重複検知を避けるため、同じイベントを連続送信しない（クールダウン: 10秒程度）

### 2. エラーハンドリング
- ネットワークエラー時はローカルにキューイングし、再送信を試みる
- 3回再送信して失敗した場合はログに記録

### 3. タイムスタンプ
- 必ずUTCタイムゾーンを使用
- ミリ秒単位のUNIXタイムスタンプを使用（JavaScriptの`Date.now()`と同等）

### 4. セキュリティ
- HTTPS通信を必ず使用
- Firebase URLは環境変数や設定ファイルで管理することを推奨

---

## トラブルシューティング

### エラー: 400 Bad Request
- JSONフォーマットが不正です
- 必須フィールドが欠けていないか確認してください

### データが表示されない
- タイムスタンプが正しいか確認（過去や未来の日時になっていないか）
- フィールド名のスペルミスがないか確認

---

## 連絡先

技術的な質問やFirebase URLについては、システム管理者にお問い合わせください。

---

**最終更新**: 2025年11月20日
