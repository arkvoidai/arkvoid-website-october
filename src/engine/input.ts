export type MoveDirection = 'forward' | 'back' | 'left' | 'right' | 'run';

export const inputState = {
  held: new Set<string>(),
  interact: false,
};

export function setHeld(key: MoveDirection, held: boolean): void {
  if (held) inputState.held.add(key);
  else inputState.held.delete(key);
}
