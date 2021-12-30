import { useContext } from 'react';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export default function useConfig(): ConfigContextValue {
  return useContext(ConfigContext);
}
