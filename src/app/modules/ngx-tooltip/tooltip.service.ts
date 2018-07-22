import { Injectable } from '@angular/core';
import { IState } from './tooltip.model';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

export interface ITooltipWithState {
  name: string;
  state: IState;
  event: any;
}

@Injectable()
export class TooltipService {

  private _tooltips: { [name: string]: IState; } = {};
  private changeVisiblityCommand = new Subject<ITooltipWithState>();

  onChangeVisibilityCommand$: Observable<ITooltipWithState>;

  constructor() {
    this.onChangeVisibilityCommand$ = this.changeVisiblityCommand.asObservable();
  }

  register(name: string, state: IState): boolean {
    try {
      if (this.exists(name)) {
        throw new Error(`A tooltip with name ${name} is already registered. Try a different name`);
      }

      this._tooltips[name] = state;
      return true;
    } catch {
      return false;
    }
  }

  toggleVisible(name: string, event: any): void {
    const visibleTooltip = this.getVisible();
    this.changeVisiblityCommand.next(this.tooltipWithState(visibleTooltip || name, event));
  }

  updateState(name: string, newState: IState) {
    if (!this.exists(name)) {
      throw new Error(`A tooltip with name ${name} not registered`);
    }

    this._tooltips[name] = newState;
  }

  protected getState(name: string): IState {
    if (!this.exists(name)) {
      throw new Error(`A tooltip with name ${name} not registered`);
    }

    return this._tooltips[name];
  }

  protected getVisible(): string {
    const names = Object.keys(this._tooltips);
    const index = names.findIndex(name => this.getState(name).visible);

    return index === -1 ? '' : names[index];
  }

  protected exists(name: string): boolean {
    return !!this._tooltips[name];
  }

  protected tooltipWithState(name: string, event: any): ITooltipWithState {
    return {
      name: name,
      state: { visible: !this.getState(name).visible },
      event: event };
  }
}
