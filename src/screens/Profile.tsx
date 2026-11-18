import { Check, ChefHat, CircleAlert, Code, Dices, Dumbbell, Globe, Mountain, Music, Palette, RotateCcw, ShieldCheck } from 'lucide-react'
import type { ComponentType } from 'react'

const categoryIcons: Record<string, ComponentType<{ size?: number }>> = { Mountain, Dumbbell, Music, Dices, ChefHat, Palette, Globe, Code }
import { Avatar } from '../components/Avatar'
import { campuses, categories, interests, languages } from '../lib/data'
import { useStore } from '../state/store'

const steps = [
  'Velg interessene dine, minst tre',
  'Swipe på folk du kunne tenkt deg å bli kjent med',
  'To matcher gir en gruppe med forslag til hva dere kan gjøre sammen',
]

export function Profile() {
  const { state, dispatch } = useStore()
  const { me } = state
  const f = me.filters
  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  return (
    <section className="screen" aria-label="Profil">
      <header className="profile-head">
        <Avatar id="me" size={96} />
        <div>
          <h1>
            {me.name}, {me.age}
          </h1>
          <p>
            {me.study} · {me.year}. år
          </p>
          <p className="muted">{me.campus}</p>
        </div>
      </header>

      <div className="panel">
        <label className="label" htmlFor="bio">
          Om meg
        </label>
        <textarea id="bio" rows={3} value={me.bio} onChange={(e) => dispatch({ type: 'setBio', bio: e.target.value })} />
      </div>

      <div className="panel">
        <h2 className="section-title">Slik funker Amici</h2>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s}>
              <span className="steps__num" aria-hidden>
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="panel">
        <div className="panel__row">
          <h2 className="section-title">Interesser</h2>
          <span className={`count${me.interests.length < 3 ? ' count--warn' : ''}`}>{me.interests.length} valgt</span>
        </div>
        {me.interests.length < 3 && (
          <p className="hint" role="status">
            <CircleAlert size={16} aria-hidden /> Velg minst tre interesser for å få gode forslag.
          </p>
        )}
        {categories.map((c) => {
          const Icon = categoryIcons[c.icon]
          return (
            <fieldset key={c.id} className="interest-group">
              <legend>
                {Icon && <Icon size={16} />} {c.label}
              </legend>
              <div className="chips chips--wrap">
                {interests
                  .filter((i) => i.category === c.id)
                  .map((i) => {
                    const on = me.interests.includes(i.id)
                    return (
                      <button
                        key={i.id}
                        type="button"
                        className={`chip${on ? ' is-on' : ''}`}
                        aria-pressed={on}
                        onClick={() => dispatch({ type: 'toggleInterest', id: i.id })}
                      >
                        {on && <Check size={15} strokeWidth={3} aria-hidden />}
                        {i.label}
                      </button>
                    )
                  })}
              </div>
            </fieldset>
          )
        })}
      </div>

      <div className="panel">
        <h2 className="section-title">Hvem vil du møte?</h2>

        <div className="field">
          <p className="label" id="age-label">
            Alder: {f.ageMin}–{f.ageMax} år
          </p>
          <div className="range-pair" role="group" aria-labelledby="age-label">
            <label>
              <span>Fra</span>
              <input
                type="range"
                min={18}
                max={35}
                step={1}
                value={f.ageMin}
                aria-label="Laveste alder"
                onChange={(e) => dispatch({ type: 'setFilters', filters: { ageMin: Math.min(Number(e.target.value), f.ageMax) } })}
              />
            </label>
            <label>
              <span>Til</span>
              <input
                type="range"
                min={18}
                max={35}
                step={1}
                value={f.ageMax}
                aria-label="Høyeste alder"
                onChange={(e) => dispatch({ type: 'setFilters', filters: { ageMax: Math.max(Number(e.target.value), f.ageMin) } })}
              />
            </label>
          </div>
        </div>

        <fieldset className="field">
          <legend className="label">Campus {f.campuses.length === 0 && <span className="muted">(alle)</span>}</legend>
          <div className="chips chips--wrap">
            {campuses.map((c) => {
              const on = f.campuses.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  className={`chip${on ? ' is-on' : ''}`}
                  aria-pressed={on}
                  onClick={() => dispatch({ type: 'setFilters', filters: { campuses: toggleIn(f.campuses, c) } })}
                >
                  {on && <Check size={15} strokeWidth={3} aria-hidden />}
                  {c}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend className="label">Språk</legend>
          <div className="chips chips--wrap">
            {languages.map((l) => {
              const on = f.languages.includes(l.id)
              return (
                <button
                  key={l.id}
                  type="button"
                  className={`chip${on ? ' is-on' : ''}`}
                  aria-pressed={on}
                  onClick={() => dispatch({ type: 'setFilters', filters: { languages: toggleIn(f.languages, l.id) } })}
                >
                  {on && <Check size={15} strokeWidth={3} aria-hidden />}
                  {l.label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend className="label">Minst felles interesser</legend>
          <div className="segmented segmented--light">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={f.minShared === n}
                className={f.minShared === n ? 'is-active' : ''}
                onClick={() => dispatch({ type: 'setFilters', filters: { minShared: n } })}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="trust">
          <ShieldCheck size={18} aria-hidden /> Bare studenter med NTNU-innlogging
        </p>
      </div>

      <div className="panel panel--plain">
        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={() => {
            if (confirm('Vil du nullstille demoen? Matcher, grupper og meldinger blir slettet.')) dispatch({ type: 'reset' })
          }}
        >
          <RotateCcw size={18} aria-hidden /> Nullstill demo
        </button>
        <p className="footnote">Demo laget for IØ2000. Alle profiler, meldinger og arrangementer er oppdiktet.</p>
      </div>
    </section>
  )
}
