This is an implementation of Conways Game of Life (actual game of life implementation taken from here: https://levelup.gitconnected.com/conways-game-of-life-in-javascript-9498ae1958fe)
to demonstrate the usage of `rx-dynamic-component`, in the game, each cell is it's own component that is loaded from the `RxDynamicComponent` service
and async'd into the outlet. These components will change if the cell changes from dead to alive or alive to dead otherwise they do not rerender.

Run `yarn nx serve conways-game-of-life` and see the generations progress!
