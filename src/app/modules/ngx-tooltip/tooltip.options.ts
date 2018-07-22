export interface ContentOptions extends ITopPosition {
  content: string;
  cls: string;
}

export interface ITopPosition extends IPosition {
  offset: IPosition;
}

export interface IPosition {
  x: number;
  y: number;
}
