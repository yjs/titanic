'use client'
import { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import * as Y from 'yjs'
import { yCollab } from 'y-codemirror.next'
import { javascript } from '@codemirror/lang-javascript'
import Filetree from './components/filetree'
import { WebsocketProvider } from 'y-websocket'
import { WebrtcProvider } from 'y-webrtc'
import { IndexeddbPersistence } from 'y-indexeddb'
import ystream from './ystream'

const ydoc = new Y.Doc()
const ytext = ydoc.getText()
ytext.observe(event => console.log('evnet', event))
//
// const websocketProvider = new WebsocketProvider('wss://demos.yjs.dev/ws', 'lf24', ydoc)
// const webrtcProvider = new WebrtcProvider('lf24', ydoc)

ystream.then(async ({y, ycollection}) => {
  ycollection.bindYdoc('root', ydoc)
  y.transact(async tr => {
    ycollection.setFileInfo(tr, 'root', 'root.md', null, 'text')
  })
})

export default function Home () {
  const [ydoc, setYdoc] = useState(null as null | Y.Doc)
  return <div id="main">
    <Filetree onDocSelection={setYdoc}/>
    {ydoc != null ? <CodeMirror extensions={[javascript(), yCollab(ydoc.getText(), null)]}/> : <div />}
  </div>
}


































// -- copy paste in case of struggle..
//
// export default function Home () {
//   const [ydoc, setYdoc] = useState(null as null | Y.Doc)
//   return <div id="main">
//     <Filetree onDocSelection={setYdoc}/>
//     {ydoc != null ? <CodeMirror extensions={[javascript(), yCollab(ydoc.getText(), null)]}/> : <div />}
//   </div>
// }
//
//
//
// ystream.then(({ y, ycollection }) => {
//   ycollection.bindYdoc('root', ydoc)
//   y.transact(async tr => {
//     await ycollection.setFileInfo(tr, 'root', 'root.md', null, 'text')
//   })
// })
