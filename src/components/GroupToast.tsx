import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Sparkles, X } from 'lucide-react'
import { useEffect } from 'react'
import { useStore } from '../state/store'
import { GroupAvatar } from './Avatar'

export function GroupToast({ onOpen }: { onOpen: (chatId: string) => void }) {
  const { state, dispatch } = useStore()
  const chat = state.chats.find((c) => c.id === state.groupToast)

  useEffect(() => {
    if (!chat) return
    const t = setTimeout(() => dispatch({ type: 'closeToast' }), 9000)
    return () => clearTimeout(t)
  }, [chat, dispatch])

  return (
    <AnimatePresence>
      {chat && (
        <motion.div
          className="toast"
          role="status"
          initial={{ y: -90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -90, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        >
          <GroupAvatar chat={chat} size={44} />
          <button
            type="button"
            className="toast__body"
            onClick={() => {
              dispatch({ type: 'closeToast' })
              onOpen(chat.id)
            }}
          >
            <span className="toast__title">
              <Sparkles size={15} aria-hidden /> Ny gruppe: {chat.name}
            </span>
            <span className="toast__text">
              Vi har funnet tre arrangementer dere kan gå på <ArrowRight size={14} aria-hidden />
            </span>
          </button>
          <button type="button" className="icon-btn" aria-label="Lukk varsel" onClick={() => dispatch({ type: 'closeToast' })}>
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
