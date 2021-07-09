import {
    ChangeDetectionStrategy,
    Component,
    ComponentFactory,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { selectActiveGame } from './state/game.state';

interface LifeCell {
    alive: number;
    component: Observable<ComponentFactory<any>>;
}

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    title = 'conways-game-of-life';

    activeGame$: Observable<LifeCell[][]> = this._store.pipe(
        select(selectActiveGame),
        map((game) =>
            game.map((row) =>
                row.map((alive: number) => ({
                    alive,
                    component: this.rxDynamicComponentService.getComponentFactory(
                        alive === 0 ? 'dead' : 'alive'
                    ),
                }))
            )
        )
    );

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
