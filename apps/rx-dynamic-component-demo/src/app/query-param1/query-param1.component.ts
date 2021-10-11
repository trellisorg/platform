import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'trellisorg-query-param1',
    templateUrl: './query-param1.component.html',
    styleUrls: ['./query-param1.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryParam1Component {
    @Input() title: string;
}
