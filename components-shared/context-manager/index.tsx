import { Context, createContext } from 'react';

const contextManager = new Map<symbol, Context<any>>();

export default function getContext<T>(key: symbol, defaultValue: T): Context<T> {
  {
    const context = contextManager.get(key);
    if (context) {
      return context;
    }
  }
  const context = createContext<T>(defaultValue);
  contextManager.set(key, context);
  return context;
}
