import {
  Directive, Inject, ComponentFactoryResolver, Input, Output,
  ViewContainerRef, ComponentRef, EventEmitter, HostListener, OnInit, OnDestroy,
} from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { ContentOptions, IPosition, ITopPosition } from './tooltip.options';
import { TooltipContentComponent } from './tooltip.component';
import { TooltipService } from './tooltip.service';

@Directive({
  selector: '[tooltip]',
})
export class ToolTipDirective implements OnInit, OnDestroy {

  @Output() beforeShow: EventEmitter<ToolTipDirective> = new EventEmitter<ToolTipDirective>();
  @Output() show: EventEmitter<ToolTipDirective> = new EventEmitter<ToolTipDirective>();
  @Output() beforeHide: EventEmitter<ToolTipDirective> = new EventEmitter<ToolTipDirective>();
  @Output() hide: EventEmitter<ToolTipDirective> = new EventEmitter<ToolTipDirective>();

  @Input() public content: string;
  @Input() public name: string;
  @Input() public ngToolTipClass: string;
  @Input() tooltipDisplayOffset: IPosition = { x: 2, y: 20 };

  @Input() showOnClick = true;
  @Input() globalShowHide = true;

  private state = { visible: false };
  private contentCmpRef: ComponentRef<TooltipContentComponent>;
  private destroy$ = new Subject();

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef,
    private _service: TooltipService,
    @Inject(DOCUMENT) private _document: any,
  ) {
    this._service.onChangeVisibilityCommand$.takeUntil(this.destroy$).subscribe(tooltip => {
      if (tooltip && tooltip.name === this.name) {
        switch (tooltip.state.visible) {
          case true:
            this.buildTooltip(tooltip.event);
            break;
          case false:
            this.hideTooltip();
            break;
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.globalShowHide) {
      if (!this.name) {
        throw new Error('Tooltip \'name\' is mandatory when \'globalShowHide\' is enabled');
      }

      this._service.register(this.name, this.state);
    }
  }

  @HostListener('click', ['$event'])
  private onClick(event: any) {
    if (!this.showOnClick) {
      return;
    }

    if (!this.globalShowHide) {
      if (this.state.visible) {
        this.hideTooltip();
      } else {
        this.buildTooltip(event);
      }
    } else {
      this._service.toggleVisible(this.name, event);
    }
  }

  showTooltip(options: ContentOptions) {
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(TooltipContentComponent);
    this.contentCmpRef = this._viewContainerRef.createComponent(componentFactory);
    this.beforeShow.emit(this);
    this._document.querySelector('body').appendChild(this.contentCmpRef.location.nativeElement);
    this.contentCmpRef.instance.options = options;
    this.setState(true);
    this.show.emit(this);
  }

  hideTooltip() {
    this.beforeHide.emit(this);
    this.contentCmpRef.destroy();
    delete this.contentCmpRef;
    this.setState(false);
    this.hide.emit(this);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private buildTooltip(event: any) {

    const options: ContentOptions = {
      content : this.content,
      cls : this.ngToolTipClass,
      ...this.getTooltipTop(event, this.tooltipDisplayOffset),
    };

    this.showTooltip(options);
  }

  private setState(visible: boolean) {
    this.state.visible = visible;
    this._service.updateState(this.name, this.state);
  }

  private getTooltipTop(event: any, tooltipDisplayOffset: IPosition): ITopPosition {

    if (event.clientX === 0 && event.clientY === 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        offset: {
          x: tooltipDisplayOffset.x + rect.width / 2,
          y: tooltipDisplayOffset.y + rect.height
        },
      };
    }

    return {
      x: event.clientX,
      y: event.clientY,
      offset: tooltipDisplayOffset,
    };
  }
}
