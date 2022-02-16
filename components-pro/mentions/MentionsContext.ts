/* tslint:disable: no-object-literal-type-assertion */
import {
  ReactNode,
  FocusEventHandler,
} from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';
import { OptionProps } from './Option';

export interface MentionsContextProps {
  notFoundContent: ReactNode;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  selectOption: (option: OptionProps) => void;
  onFocus: FocusEventHandler<HTMLElement>;
  onBlur: FocusEventHandler<HTMLElement>;
}

// We will never use default, here only to fix TypeScript warning
const MentionsContext = getContext<MentionsContextProps>(Symbols.MentionsContext, null as any);

export const MentionsContextProvider = MentionsContext.Provider;
export const MentionsContextConsumer = MentionsContext.Consumer;
