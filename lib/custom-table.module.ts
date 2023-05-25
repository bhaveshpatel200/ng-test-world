import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CustomTableComponent } from './custom-table';
import { ColumnFilterComponent } from './column-filter';
import { ColumnHeaderComponent } from './column-header';
import { IconCheckComponent } from './icon-check';
import { IconDashComponent } from './icon-dash';
import { IconFilterComponent } from './icon-filter';

// directive
import { SlotDirective } from './slot.directive';

@NgModule({
    imports: [CommonModule, FormsModule],
    declarations: [CustomTableComponent, ColumnFilterComponent, ColumnHeaderComponent, IconCheckComponent, IconDashComponent, IconFilterComponent, SlotDirective],
    exports: [CustomTableComponent, ColumnFilterComponent, ColumnHeaderComponent, IconCheckComponent, IconDashComponent, IconFilterComponent, SlotDirective],
})
export class CustomTableModule {}
