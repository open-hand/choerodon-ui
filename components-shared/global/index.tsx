import { ReactNode } from 'react';

export interface Globals {
  EVAL_SUPPORT?: boolean | undefined;
  STICKY_SUPPORT?: boolean | undefined;
  FLEX_SUPPORT?: boolean | undefined;
  CSS_ANIMATION_SUPPORT?: boolean | undefined;
  PLACEHOLDER_SUPPORT?: boolean | undefined;
  ROOT_STYLE?: CSSStyleDeclaration;
  SCROLL_BAR_WIDTH_VERTICAL?: number;
  SCROLL_BAR_WIDTH_HORIZONTAL?: number;
  DEFAULT_SPIN_INDICATOR?: ReactNode;
}

const global: Globals = {};

export default global;
