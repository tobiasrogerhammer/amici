import { useState } from 'react'
import { EventSheet } from './components/EventSheet'
import { GroupToast } from './components/GroupToast'
import { TabBar } from './components/TabBar'
import { Chats } from './screens/Chats'
import { Discover, MatchOverlay } from './screens/Discover'
import { Events } from './screens/Events'
import { Profile } from './screens/Profile'
import { useStore } from './state/store'
import type { AmiciEvent, Tab } from './types'

export default function App() {
  const { state, dispatch } = useStore()
  const [tab, setTab] = useState<Tab>('discover')
  const [openChatId, setOpenChatId] = useState<string | null>(null)
  const [sheet, setSheet] = useState<AmiciEvent | null>(null)

  const openChat = (id: string) => {
    setTab('chats')
    setOpenChatId(id)
  }

  const selectTab = (t: Tab) => {
    // Et trykk i menyen lukker match-animasjonen, som et alternativ til krysset
    if (state.match) dispatch({ type: 'closeMatch' })
    if (t === tab && t === 'chats') setOpenChatId(null)
    setTab(t)
  }

  const inChat = tab === 'chats' && openChatId != null

  return (
    <div className="app">
      <main className="app__main">
        {tab === 'discover' && <Discover onEditProfile={() => selectTab('profile')} />}
        {tab === 'events' && <Events onOpenEvent={setSheet} />}
        {tab === 'chats' && <Chats openChatId={openChatId} setOpenChatId={setOpenChatId} onOpenEvent={setSheet} />}
        {tab === 'profile' && <Profile />}
      </main>

      <MatchOverlay onSayHi={openChat} />
      <GroupToast onOpen={openChat} />
      {!inChat && <TabBar active={tab} onSelect={selectTab} />}
      <EventSheet event={sheet} onClose={() => setSheet(null)} />
    </div>
  )
}
