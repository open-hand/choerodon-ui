export enum ResizeType {
  both = 'both',
  vertical = 'vertical',
  horizontal = 'horizontal',
  none = 'none',
}

export interface AutoSizeType {
  minRows?: number;
  maxRows?: number;
}
