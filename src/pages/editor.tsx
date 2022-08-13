import * as React from 'react'
import styled from 'styled-components'
import { useStateWithStorage } from '../hooks/use_state_with_storage'
import { putMemo } from '../indexeddb/memos'
import { Button } from '../components/button'
import { SaveModal } from '../components/save_modal'
import { Link } from 'react-router-dom'
import { Header } from '../components/header'
import ConvertMarkdownWorker from 'worker-loader!../worker/convert_markdown_worker'

const convertMarkdownWorker = new ConvertMarkdownWorker()
const { useState, useEffect } = React

const Wrapper = styled.div`
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 3rem;
`


const HeaderArea = styled.div`
  position: fixed;
  right: 0;
  top: 3rem;
  top: 0;
  left: 0;
`


const TextArea = styled.textarea`
  border-right: 1px solid silver;
  border-top: 1px solid silver;
  bottom: 0;
  font-size: 1rem;
  left: 0;
  padding: 0.5rem;
  position: absolute;
  top: 0;
  width: 50vw;
`

const Preview = styled.div`
  border-top: 1px solid silver;
  bottom: 0;
  overflow-y: scroll;
  padding: 1rem;
  position: absolute;
  right: 0;
  top: 0;
  width: 50vw;
`

interface Props {
  text: string
  setText: (text: string) => void
}

// シンプルな関数で React のコンポーネントを返すと定義
// useStateWithProps を使ってこのページで管理していた状態を、呼び出し元からパラメーターとして渡される処理に変更
export const Editor: React.FC<Props> = (props) => {
  const { text, setText } = props

  // モーダルを表示するかどうかのフラグを管理
  const [showModal, setShowModal] = useState(false)

  // HTML の文字列を管理する状態を用意します。
  const [html, setHtml] = useState('')

  useEffect(() => {
    // Web Worker から受け取った処理結果（HTML）で状態を更新
    convertMarkdownWorker.onmessage = (event) => {
      setHtml(event.data.html)
    }
  }, [])

  useEffect(() => {
    convertMarkdownWorker.postMessage(text)
  }, [text])

  return (
    // この空のタグは <React.Fragment> を短縮した書き方で、実際には描画されないタグ
    <>
      <HeaderArea>
        <Header title="Markdown Editor">
          <Button onClick={() => setShowModal(true)}>
            保存する
          </Button>
          <Link to="/history">
            履歴を見る
          </Link>
        </Header>
      </HeaderArea>
      <Wrapper>
        <TextArea
            onChange={(event) => setText(event.target.value)}
            value={text}
          />
        <Preview>
        {/* <div dangerouslySetInnerHTML={{ __html: html }} /> */}
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </Preview>
      </Wrapper>
      {showModal && (
          <SaveModal
            // onSave は、IndexedDBへの保存処理とモーダルを閉じるため showModal へ false をセットします
            onSave={(title: string): void => {
              putMemo(title, text)
              setShowModal(false)
            }}
            // onCancel はモーダルを閉じるだけなので showModal に false をセットする処理
            onCancel={() => setShowModal(false)}
          />
        )}
    </>
  )
}
