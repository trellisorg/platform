/// <reference lib="webworker" />

import { updateLifeCycle } from './state/game.utils';

addEventListener('message', ({ data }: { data: number[][] }) => {
    const newGame = updateLifeCycle(data);
    postMessage(newGame);
});
