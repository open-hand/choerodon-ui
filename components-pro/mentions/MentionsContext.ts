/* tslint:disable: no-object-literal-type-assertion */
import {
  ReactNode,
  FocusEventHandler,
  Context,
  createContext,
} from 'react';
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
const MentionsContext: Context<MentionsContextProps> = createContext(null as any);

export const MentionsContextProvider = MentionsContext.Provider;
export const MentionsContextConsumer = MentionsContext.Consumer;
