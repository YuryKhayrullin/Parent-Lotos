import { observer } from 'mobx-react-lite'
import { ArrowLeft, Waves } from 'lucide-react'
import { useStore } from '@/stores/store-context'

export const AuthScreen = observer(function AuthScreen() {
  const { auth } = useStore()

  const handleNext = () => {
    if (auth.step === 'phone') {
      auth.requestOtp()
    } else {
      auth.verifyOtp()
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

        {auth.step === 'phone' ? (
          <>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#be43be]">Кабинет родителя</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.06em]">Войдите в кабинет</h1>
            <p className="mt-3 text-sm leading-6 text-[#718097]">
              Введите номер телефона, который указан в договоре клуба.
            </p>
            <label className="mt-7 block text-xs font-bold">
              Номер телефона
              <input
                value={auth.phone}
                onChange={(e) => auth.setPhone(e.target.value)}
                inputMode="tel"
                placeholder="+7 (___) ___-__-__"
                className="mt-2 min-h-14 w-full rounded-2xl border border-[#dfe6ed] px-4 text-base outline-none focus:border-[#be43be]"
              />
            </label>
            {auth.error && <p className="mt-3 text-sm font-semibold text-red-600">{auth.error}</p>}
            <button
              disabled={auth.phone.length < 5 || auth.loading}
              onClick={handleNext}
              className="mt-5 min-h-14 w-full rounded-2xl bg-[#be43be] text-sm font-black text-white disabled:opacity-40"
            >
              {auth.loading ? 'Отправка…' : 'Получить код'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => auth.backToPhone()}
              className="flex items-center gap-2 text-xs font-bold text-[#718097]"
            >
              <ArrowLeft size={15} />
              Изменить номер
            </button>
            <h1 className="mt-6 text-3xl font-black tracking-[-.06em]">Введите код</h1>
            <p className="mt-3 text-sm leading-6 text-[#718097]">
              Код отправлен на номер
              <br />
              <strong className="text-[#19283c]">{auth.phone}</strong>
            </p>
            {auth.devCode && (
              <p className="mt-3 rounded-2xl bg-[#f4f6f9] p-3 text-center text-xs font-bold text-[#718097]">
                Dev-код: <span className="text-[#19283c]">{auth.devCode}</span>
              </p>
            )}
            <input
              autoFocus
              value={auth.code}
              onChange={(e) => auth.setCode(e.target.value)}
              inputMode="numeric"
              placeholder="••••"
              className="mt-7 min-h-16 w-full rounded-2xl border border-[#dfe6ed] text-center text-2xl tracking-[.4em] outline-none focus:border-[#be43be]"
            />
            {auth.error && <p className="mt-3 text-sm font-semibold text-red-600">{auth.error}</p>}
            <button
              disabled={(auth.code.replace(/\D/g, '').length < 4 || auth.code.replace(/\D/g, '').length > 6) || auth.loading}
              onClick={handleNext}
              className="mt-5 min-h-14 w-full rounded-2xl bg-[#be43be] text-sm font-black text-white disabled:opacity-40"
            >
              {auth.loading ? 'Проверка…' : 'Открыть кабинет'}
            </button>
          </>
        )}
      </section>
    </main>
  )
})
