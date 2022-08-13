// キャッシュの名前を定義
const CacheName = 'Cache:v1'

// self はサービスワーカー自身を指します。
// addEventListener で各イベントにコールバックを登録しています。
// install activate は前パートで説明したライフサイクルの各イベントを指します。
self.addEventListener('install', (event) => {  
  console.log('ServiceWorker install:', event)  
})  
  
self.addEventListener('activate', (event) => {  
  console.log('ServiceWorker activate:', event)  
})
  

const networkFallingBackToCache = async (request) => {

  // 定義した名前で、キャッシュを開きます。
  const cache = await caches.open(CacheName)
  try {

    // 通常の fetch リクエストを実行してレスポンスを取得
    const response = await fetch(request)

    // レスポンス内容をキャッシュに保存しています。
    // なお response.clone() でレスポンスの内容をコピーしてから保存しなければなりません。
    // これはレスポンスの内部で一度しか読み取りできない処理があるためです。
    await cache.put(request, response.clone())

    // レスポンスを呼び出し元に返却
    return response
  } catch (err) {
    console.error(err)
    return cache.match(request)
  }
}


// fetch とはネットワークなどを経由してリソースを取得するために使用するAPI
// ここにサービスワーカーは介入できるので、リソース取得に対して様々な処理を挟むことができます。
self.addEventListener('fetch', (event) => {
  // console.log('Fetch to:', event.request.url)

  // ネットワークリクエストを行って結果をメインスレッドに戻す処理です。
  // event.respondWith は簡潔に言うと、非同期処理（Promise）の実行終了まで待機してくれるメソッド
  // event.respondWith(fetch(event.request))

  event.respondWith(networkFallingBackToCache(event.request))
})
