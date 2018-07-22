import { TooltipContentComponent } from './tooltip.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolTipDirective } from './tooltip.directive';
import { TooltipService } from './tooltip.service';

@NgModule({
    imports: [CommonModule],
    declarations: [ToolTipDirective, TooltipContentComponent],
    exports: [ToolTipDirective],
    entryComponents: [TooltipContentComponent],
    providers: [TooltipService],
})
export class ToolTipModule { }
