import { describe, expect, it } from 'vitest';
import { createInitialWorld, reduceWorld } from '../src/engine/runtime';

describe('world authority', () => {
  it('records a conversation and grounded memory once', () => {
    let state = createInitialWorld();
    state = reduceWorld(state, { type: 'talk', actor: 'lian' });
    expect(state.inhabitants.lian.memory).toHaveLength(1);
    expect(state.inhabitants.lian.trust).toBe(1);
    const count = state.events.length;
    state = reduceWorld(state, { type: 'talk', actor: 'lian' });
    expect(state.inhabitants.lian.memory).toHaveLength(1);
    expect(state.events).toHaveLength(count + 1);
  });

  it('rejects a forbidden relic theft without changing inventory', () => {
    const state = createInitialWorld();
    const next = reduceWorld(state, { type: 'take-relic', actor: 'lian' });
    expect(next.events.at(-1)?.accepted).toBe(false);
    expect(next.herbs).toBe(state.herbs);
  });

  it('rejects an invalid item transfer and preserves inventory', () => {
    const state = createInitialWorld();
    const next = reduceWorld(state, { type: 'offer-herb', actor: 'lian' });
    expect(next.herbs).toBe(1);
    expect(next.events.at(-1)?.accepted).toBe(false);
  });

  it('requires keeper trust before archive inspection', () => {
    const state = createInitialWorld();
    const next = reduceWorld(state, { type: 'inspect-archive', actor: 'wen' });
    expect(next.discoveries).not.toContain('sealed-archive');
    expect(next.events.at(-1)?.accepted).toBe(false);
  });

  it('persists previously recorded facts across a world day', () => {
    let state = reduceWorld(createInitialWorld(), { type: 'talk', actor: 'kai' });
    state = reduceWorld(state, { type: 'advance-day' });
    expect(state.day).toBe(2);
    expect(state.inhabitants.kai.memory[0]).toContain('mist');
  });

  it('records a discovery only once', () => {
    let state = createInitialWorld();
    state = reduceWorld(state, { type: 'discover', landmark: 'spirit-beacon' });
    state = reduceWorld(state, { type: 'discover', landmark: 'spirit-beacon' });
    expect(state.qi).toBe(5);
    expect(state.discoveries).toEqual(['spirit-beacon']);
  });
});
