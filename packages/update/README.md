# @trellisorg/update

Provides a decorator (`@Update`) that allows you to hook into the assignment of a property in a class and then call some
function on an injectable to update it.

## Install

yarn
`yarn add @trellisorg/update`

npm
`npm i @trellisorg/update --save`

## Usage

```typescript
@Injectable()
class Store {
    readonly counter$ = new BehaviorSubject<number>(0);

    readonly counter2$ = new BehaviorSubject<number>(0);

    readonly setCounter = (value: number) => this.counter$.next(value);

    readonly setCounterTwo = (value: number) => this.counter2$.next(value);
}

@Component({
    selector: 'test',
    styles: [''],
    template: `<div id="input">
            {{ counter }}
        </div>
        <div id="observable">{{ counter$ | async }}</div>
        <div id="input">
            {{ counterTwo }}
        </div>
        <div id="observable">{{ counterTwo$ | async }}</div>`,
    providers: [Store],
})
class TestComponent {
    // Will call `setCounter` on the instantiated `Store`
    // whenever `counter` is assigned a new value.
    @Input() @Update(Store) counter = 0;

    // Will call `setCounterTwo` on the instantiated `Store`
    // whenever `counterTwo` is assigned a new value
    @Input() @Update(Store, 'setCounterTwo') counterTwo = 0;

    readonly counter$ = this.store.counter$;

    readonly counterTwo$ = this.store.counter2$;

    constructor(private readonly store: Store) {}
}
```

> Caveat: Properties must be explicitly defined, if they are optional properties you
> have to set them to `undefined` otherwise this library cannot patch the correct
> setters on the property.
