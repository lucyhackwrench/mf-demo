import { createStore, createEvent } from 'effector';

export const increment = createEvent<void>('increment');
export const decrement = createEvent<void>('decrement');
export const reset = createEvent<void>('reset');

export const $counter = createStore(0)
  .on(increment, (n) => n + 1)
  .on(decrement, (n) => n - 1)
  .on(reset, () => 0);
