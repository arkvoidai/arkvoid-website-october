export type InhabitantId = 'lian' | 'wen' | 'kai';
export type EventKind = 'WorldStarted' | 'ConversationRecorded' | 'ItemTransferred' | 'ArchiveInspected' | 'LandmarkDiscovered' | 'WorldAdvanced' | 'ActionRejected';

export interface WorldEvent {
  id: number;
  day: number;
  kind: EventKind;
  message: string;
  actor?: InhabitantId;
  accepted: boolean;
}

export interface InhabitantState {
  id: InhabitantId;
  name: string;
  role: string;
  memory: string[];
  trust: number;
  goal: string;
}

export interface WorldState {
  day: number;
  qi: number;
  herbs: number;
  discoveries: string[];
  inhabitants: Record<InhabitantId, InhabitantState>;
  events: WorldEvent[];
  nextEventId: number;
}

export type WorldAction =
  | { type: 'talk'; actor: InhabitantId }
  | { type: 'offer-herb'; actor: InhabitantId }
  | { type: 'inspect-archive'; actor: InhabitantId }
  | { type: 'take-relic'; actor: InhabitantId }
  | { type: 'discover'; landmark: string }
  | { type: 'advance-day' };

export function createInitialWorld(): WorldState {
  return {
    day: 1,
    qi: 0,
    herbs: 1,
    discoveries: [],
    nextEventId: 43,
    inhabitants: {
      lian: { id: 'lian', name: 'Lian Chen', role: 'Outer disciple', memory: [], trust: 0, goal: 'Deliver the sealed letter' },
      wen: { id: 'wen', name: 'Elder Wen', role: 'Archive keeper', memory: [], trust: 0, goal: 'Keep the archive protected' },
      kai: { id: 'kai', name: 'Kai Ren', role: 'Herbalist', memory: [], trust: 0, goal: 'Prepare a recovery tonic' },
    },
    events: [{ id: 42, day: 1, kind: 'WorldStarted', message: 'The Jade Sect is ready. The world state has been initialized.', accepted: true }],
  };
}

function append(state: WorldState, event: Omit<WorldEvent, 'id' | 'day'>): WorldState {
  const next = { ...state, inhabitants: { ...state.inhabitants }, discoveries: [...state.discoveries], events: [...state.events] };
  next.events.push({ ...event, id: state.nextEventId, day: state.day });
  next.nextEventId += 1;
  next.events = next.events.slice(-60);
  return next;
}

export function reduceWorld(state: WorldState, action: WorldAction): WorldState {
  switch (action.type) {
    case 'talk': {
      const person = state.inhabitants[action.actor];
      if (person.memory.length) {
        return append(state, { kind: 'ConversationRecorded', actor: action.actor, accepted: true, message: `${person.name} recalls your previous conversation; no duplicate memory was written.` });
      }
      const lines: Record<InhabitantId, { text: string; goal: string }> = {
        lian: { text: 'Lian confides that the sealed letter is meant for the southern pavilion.', goal: 'Deliver the letter to the southern pavilion' },
        wen: { text: 'Elder Wen agrees to consider a supervised archive visit.', goal: 'Evaluate the archive visitor' },
        kai: { text: 'Kai describes how mountain mist changes the healing herbs.', goal: 'Prepare a recovery tonic' },
      };
      const next = append(state, { kind: 'ConversationRecorded', actor: action.actor, accepted: true, message: lines[action.actor].text });
      next.inhabitants[action.actor] = { ...person, memory: [...person.memory, lines[action.actor].text], trust: person.trust + 1, goal: lines[action.actor].goal };
      return next;
    }
    case 'offer-herb': {
      if (action.actor !== 'kai') return append(state, { kind: 'ActionRejected', actor: action.actor, accepted: false, message: 'Rejected: item transfers are only valid with Kai Ren at the apothecary.' });
      if (state.herbs < 1 || state.inhabitants.kai.memory.some((m) => m.includes('healing herb'))) return append(state, { kind: 'ActionRejected', actor: action.actor, accepted: false, message: 'Rejected: the inventory has no unassigned healing herb.' });
      const next = append({ ...state, herbs: state.herbs - 1 }, { kind: 'ItemTransferred', actor: 'kai', accepted: true, message: 'One healing herb was transferred to Kai Ren and recorded in the event journal.' });
      next.inhabitants.kai = { ...state.inhabitants.kai, trust: state.inhabitants.kai.trust + 1, memory: [...state.inhabitants.kai.memory, 'You offered Kai a healing herb. He accepted and promised to prepare a tonic.'] };
      return next;
    }
    case 'inspect-archive': {
      if (action.actor !== 'wen' || state.inhabitants.wen.trust < 1) return append(state, { kind: 'ActionRejected', actor: action.actor, accepted: false, message: 'Rejected: the archive keeper has not granted a supervised visit.' });
      if (state.discoveries.includes('sealed-archive')) return append(state, { kind: 'ActionRejected', actor: action.actor, accepted: false, message: 'Rejected: the archive inspection is already recorded.' });
      const next = append({ ...state, discoveries: [...state.discoveries, 'sealed-archive'] }, { kind: 'ArchiveInspected', actor: 'wen', accepted: true, message: 'A supervised inspection of the sealed archive was recorded.' });
      next.inhabitants.wen = { ...state.inhabitants.wen, memory: [...state.inhabitants.wen.memory, 'You inspected the sealed archive with permission.'] };
      return next;
    }
    case 'take-relic':
      return append(state, { kind: 'ActionRejected', actor: action.actor, accepted: false, message: 'Rejected: the relic is protected by world ownership rules. Inventory and ownership are unchanged.' });
    case 'discover':
      if (state.discoveries.includes(action.landmark)) return state;
      return append({ ...state, discoveries: [...state.discoveries, action.landmark], qi: state.qi + 5 }, { kind: 'LandmarkDiscovered', accepted: true, message: `Landmark discovered: ${action.landmark}. Five qi were added to your cultivation record.` });
    case 'advance-day':
      return append({ ...state, day: state.day + 1 }, { kind: 'WorldAdvanced', accepted: true, message: `World clock advanced to day ${state.day + 1}. Inhabitant memories were preserved.` });
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

export function relationshipLabel(person: InhabitantState): string {
  if (person.trust >= 3) return 'Trusted';
  if (person.trust === 2) return 'Known';
  if (person.trust === 1) return 'Recognizes you';
  return 'Unfamiliar';
}
