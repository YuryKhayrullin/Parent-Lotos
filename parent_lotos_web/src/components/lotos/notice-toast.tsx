import { observer } from 'mobx-react-lite'
import { Check } from 'lucide-react'
import { useStore } from '@/stores/store-context'

export const NoticeToast = observer(function NoticeToast() {
  const { app } = useStore()

  return (
    <button
      onClick={() => app.clearNotice()}
      className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#122e4d] px-5 py-3 text-xs font-bold text-white shadow-xl"
    >
      {app.notice} <Check className="ml-2 inline" size={14} />
    </button>
  )
})
