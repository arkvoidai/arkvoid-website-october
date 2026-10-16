'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { createInitialWorld, reduceWorld, relationshipLabel, type InhabitantId, type WorldAction, type WorldState } from '../engine/runtime';
import { inputState, setHeld, type MoveDirection } from '../engine/input';

const WorldCanvas = dynamic(() => import('./WorldCanvas'), { ssr: false });
const SAVE_KEY = 'arkvoid.matrix-world.save.v1';
const personIds: InhabitantId[] = ['lian', 'wen', 'kai'];

function safeLoad(): WorldState {
  const initial = createInitialWorld();
  if (typeof window === 'undefined') return initial;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return initial;
    const value = JSON.parse(raw) as WorldState;
    if (!value || !Number.isInteger(value.day) || !value.inhabitants || !Array.isArray(value.events) || !Array.isArray(value.discoveries)) return initial;
    for (const id of personIds) if (!value.inhabitants[id] || !Array.isArray(value.inhabitants[id].memory)) return initial;
    return value;
  } catch { return initial; }
}

export default function WorldApp() {
  const [world, setWorld] = useState<WorldState>(() => createInitialWorld());
  const [selected, setSelected] = useState<InhabitantId>('lian');
  const [notice, setNotice] = useState('The courtyard is quiet after rain.');
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const person = world.inhabitants[selected];

  useEffect(() => {
    setWorld(safeLoad());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(world)); } catch { setNotice('Local storage is unavailable; progress may not survive reload.'); }
  }, [world, ready]);

  const act = useCallback((action: WorldAction) => {
    setWorld((previous) => {
      const next = reduceWorld(previous, action);
      const last = next.events[next.events.length - 1];
      setNotice(last?.message ?? 'The world state is unchanged.');
      return next;
    });
  }, []);

  const interact = useCallback(() => {
    act({ type: 'talk', actor: selected });
  }, [act, selected]);

  const reset = useCallback(() => {
    setWorld(createInitialWorld());
    setNotice('The local world has been reset to its starting state.');
    try { localStorage.removeItem(SAVE_KEY); } catch {}
  }, []);

  const eventRows = useMemo(() => world.events.slice(-4).reverse(), [world.events]);
  const controls: { label: string; direction: MoveDirection }[] = [
    { label: 'Forward', direction: 'forward' }, { label: 'Left', direction: 'left' },
    { label: 'Back', direction: 'back' }, { label: 'Right', direction: 'right' },
  ];

  return <main className="world-app">
    <WorldCanvas selected={selected} onSelect={setSelected} onDiscover={(name) => act({ type:'discover', landmark:name })} />
    <div className="vignette" aria-hidden="true" />
    <header className="topbar">
      <div className="brand-lockup"><span className="brand-mark">A</span><span><strong>ARKVOID</strong><small>MATRIX WORLD / STUDY 001</small></span></div>
      <div className="world-status"><span className="live-dot" /> LOCAL WORLD INSTANCE <span className="status-divider">/</span> DAY {String(world.day).padStart(2,'0')}</div>
      <button className="icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Open world menu">☰</button>
    </header>

    <aside className="quest-panel">
      <span className="micro-heading">CURRENT PATH</span>
      <h1>The Jade Sect</h1>
      <p>{world.discoveries.length ? 'Something in this place has changed. Keep exploring.' : 'Find your place in a world that remembers.'}</p>
      <div className="quest-meta"><span>QI <b>{world.qi}</b></span><span>DISCOVERIES <b>{world.discoveries.length}</b></span></div>
    </aside>

    <div className="scene-caption"><span>THE SECT COURTYARD</span><i /> <span>LIGHT RAIN / EARLY MORNING</span></div>

    <section className="inhabitant-panel">
      <div className="panel-top"><span className="micro-heading">INHABITANT</span><span className="memory-status"><i /> MEMORY LINKED</span></div>
      <h2>{person.name}</h2>
      <p className="person-role">{person.role}</p>
      <blockquote>{person.memory.at(-1) ?? 'No personal event has been recorded for this visitor yet.'}</blockquote>
      <div className="person-stats"><div><span>RELATIONSHIP</span><strong>{relationshipLabel(person)}</strong></div><div><span>ACTIVE GOAL</span><strong>{person.goal}</strong></div></div>
      <div className="person-picker" role="group" aria-label="Choose an inhabitant">
        {personIds.map((id) => <button key={id} className={id === selected ? 'person-tab active' : 'person-tab'} onClick={() => setSelected(id)}><span className={'avatar avatar-' + id}>{world.inhabitants[id].name[0]}</span><span><b>{world.inhabitants[id].name}</b><small>{world.inhabitants[id].role}</small></span></button>)}
      </div>
      <div className="actions">
        <button className="action-primary" onClick={interact}>Speak with {person.name.split(' ')[0]} <span>↗</span></button>
        <div className="action-grid">
          <button onClick={() => act({type:'offer-herb',actor:selected})}>Offer healing herb</button>
          <button onClick={() => act({type:'inspect-archive',actor:selected})}>Inspect sealed archive</button>
          <button className="danger-action" onClick={() => act({type:'take-relic',actor:selected})}>Take forbidden relic</button>
          <button onClick={() => act({type:'advance-day'})}>Rest until tomorrow</button>
        </div>
      </div>
    </section>

    <div className="toast" role="status" aria-live="polite"><span className={world.events.at(-1)?.accepted ? 'toast-mark' : 'toast-mark rejected'}>{world.events.at(-1)?.accepted ? '✓' : '×'}</span><span>{notice}</span></div>

    <div className="touch-controls" aria-label="Touch movement">
      {controls.map(({label,direction}) => <button key={direction} aria-label={label} onPointerDown={(e) => { e.preventDefault(); setHeld(direction,true); }} onPointerUp={() => setHeld(direction,false)} onPointerLeave={() => setHeld(direction,false)} onPointerCancel={() => setHeld(direction,false)}>{direction === 'forward' ? '↑' : direction === 'back' ? '↓' : direction === 'left' ? '←' : '→'}</button>)}
      <button className="interact-touch" onClick={interact}>E</button>
    </div>

    {menuOpen && <div className="menu-popover"><span className="micro-heading">WORLD SESSION</span><p>Browser-local prototype. The event journal and memory stay on this device.</p><button onClick={() => {act({type:'advance-day'});setMenuOpen(false);}}>Advance world clock</button><button onClick={() => {reset();setMenuOpen(false);}}>Reset this world</button><button onClick={() => setMenuOpen(false)}>Close menu</button></div>}

    <aside className="journal-panel">
      <div className="journal-heading"><span className="micro-heading">EVENT JOURNAL</span><span>{String(world.events.length).padStart(2,'0')} RECORDS</span></div>
      {eventRows.map((event) => <div key={event.id} className="journal-row"><span className="event-id">EVT / {String(event.id).padStart(4,'0')}</span><span className={event.accepted ? 'event-state' : 'event-state rejected'}>{event.accepted ? 'COMMITTED' : 'REJECTED'}</span><p>{event.message}</p></div>)}
      <div className="journal-foot"><span>WORLD AUTHORITY / LOCAL</span><button onClick={reset}>RESET SANDBOX ↻</button></div>
    </aside>

    <footer className="bottom-note"><span>ARKVOID / PERSISTENT EMBODIED WORLD COMPUTING</span><span>PROTOTYPE BUILD 001</span></footer>
  </main>;
}
