/**
 * オブジェクトの差分を検知するユーティリティ
 */

export interface DiffResult<T> {
  hasChanged: boolean
  changedFields: (keyof T)[]
  oldValue: Partial<T>
  newValue: Partial<T>
}

/**
 * 2つのオブジェクトを比較して差分を検出
 * 
 * @param oldObj - 比較元のオブジェクト
 * @param newObj - 比較先のオブジェクト
 * @param ignoreFields - 比較から除外するフィールド
 * @returns 差分情報
 */
export function detectDiff<T extends Record<string, any>>(
  oldObj: T,
  newObj: T,
  ignoreFields: (keyof T)[] = []
): DiffResult<T> {
  const changedFields: (keyof T)[] = []
  const oldValue: Partial<T> = {}
  const newValue: Partial<T> = {}

  for (const key in newObj) {
    if (ignoreFields.includes(key)) continue
    
    if (oldObj[key] !== newObj[key]) {
      changedFields.push(key)
      oldValue[key] = oldObj[key]
      newValue[key] = newObj[key]
    }
  }

  return {
    hasChanged: changedFields.length > 0,
    changedFields,
    oldValue,
    newValue
  }
}

/**
 * 数値の変化が閾値を超えているか確認
 * 
 * @param oldValue - 古い値
 * @param newValue - 新しい値
 * @param threshold - 閾値（絶対値）
 * @returns 閾値を超えた変化があればtrue
 */
export function hasSignificantChange(
  oldValue: number,
  newValue: number,
  threshold: number
): boolean {
  return Math.abs(newValue - oldValue) >= threshold
}

/**
 * 配列要素を安全にランダム取得
 * 
 * @param array - 取得元の配列
 * @returns ランダムな要素
 */
export function getRandomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('配列が空です')
  }
  return array[Math.floor(Math.random() * array.length)]!
}
