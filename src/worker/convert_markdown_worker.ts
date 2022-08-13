import * as marked from 'marked'
import * as sanitizeHtml from 'sanitize-html'

// Web Worker を変数にセット
const worker: Worker = self as any  
  
// メインスレッドからデータを渡された際に実行する関数を定義
worker.addEventListener('message', (event) => {  

  const text = event.data
  const html = sanitizeHtml(marked(text), { allowedTags: [...sanitizeHtml.defaults.allowedTags, 'h1', 'h2'] })
  worker.postMessage({ html })
})
