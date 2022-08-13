import Dexie from 'dexie'

export interface MemoRecord {
  datetime: string
  title: string
  text: string
}

const database = new Dexie('markdown-editor')
database.version(2).stores({ memos: '&datetime' })
const memos: Dexie.Table<MemoRecord, string> = database.table('memos')

export const putMemo = async (title: string, text: string): Promise<void> => {
  const datetime = new Date().toISOString()
  await memos.put({ datetime, title, text })
}

// 1ページあたりの10件
const NUM_PER_PAGE: number = 10

export const getMemoPageCount = async (): Promise<number> => {
  // memos テーブルから総件数を取得します。
  // count() は Dexie に定義された関数です。
  const totalCount = await memos.count()

  // トータルの件数から1ページあたりの件数で割って、ページ数を算出
  const pageCount = Math.ceil(totalCount / NUM_PER_PAGE)

  // 最後の三項演算子は、0件でも1ページと判定
  return pageCount > 0 ? pageCount : 1
}

export const getMemos = (page: number): Promise<MemoRecord[]> => {
  const offset = (page - 1) * NUM_PER_PAGE
  return memos.orderBy('datetime')
              .reverse()
              .offset(offset)
              .limit(NUM_PER_PAGE)
              .toArray()
}
