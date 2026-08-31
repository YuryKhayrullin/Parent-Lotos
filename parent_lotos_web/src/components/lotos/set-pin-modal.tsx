import { observer } from 'mobx-react-lite'
import { useStore } from '@/stores/store-context'
import { Waves } from 'lucide-react'

export const SetPinModal = observer(function SetPinModal() {
  const { auth } = useStore()

  const handleSave = () => {
    if (auth.pin.length === 4) {
      auth.savePin(auth.pin)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#102b49] px-4 py-8">
      <section className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl sm:p-9">
        <div className="mb-10 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#be43be] text-white">
            <Waves size={24} />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#8295aa]">Sport Club</p>
            <p className="text-xl font-black text-[#19283c]">Лотос</p>
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-[-.06em]">Установите PIN-код</h1>
        <p className="mt-3 text-sm leading-6 text-[#718097]">
          Для защиты вашего аккаунта установите 4-значный PIN-код для последующих входов.
        </p>
        <input
          autoFocus
          value={auth.pin}
          onChange={(e) => auth.setPin(e.target.value)}
          inputMode="numeric"
          placeholder="••••"
          className="mt-7 min-h-16 w-full rounded-2xl border border-[#dfe6ed] text-center text-2xl tracking-[.4em] outline-none focus:border-[#be43be]"
        />
        {auth.error && <p className="mt-3 text-sm font-semibold text-red-600">{auth.error}</p>}
        <button
          disabled={auth.pin.length < 4 || auth.loading}
          onClick={handleSave}
          className="mt-5 min-h-14 w-full rounded-2xl bg-[#be43be] text-sm font-black text-white disabled:opacity-40"
        >
          {auth.loading ? 'Сохранение...' : 'Установить'}
        </button>
      </section>
    </main>
  )
})
