import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { selectCurrentGeneration, selectGeneration } from './state/game.state';

interface LifeCell {
    alive: number;
    component: Observable<Type<any>>;
}

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    title = 'conways-game-of-life';

    readonly activeGame$: Observable<LifeCell[][]> = this._store.pipe(
        select(selectCurrentGeneration),
        map((game) =>
            game.map((row) =>
                row.map((alive: number) => ({
                    alive,
                    component: this.rxDynamicComponentService.getComponent(
                        alive === 0 ? 'dead' : 'alive'
                    ),
                }))
            )
        )
    );

    readonly generation$ = this._store.pipe(select(selectGeneration));

    constructor(
        private rxDynamicComponentService: RxDynamicComponentService,
        private _store: Store
    ) {}

    trackLife(index: number, cell: LifeCell): string {
        return cell.alive.toString(10);
    }

    trackLifeRow(index: number, row: LifeCell[]): string {
        return row.map((cell) => cell.alive).toString();
    }
}
