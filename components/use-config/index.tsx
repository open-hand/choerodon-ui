import { useContext } from 'react';
import ConfigContext, { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';

export default function useConfig(): ConfigContextValue {
  return useContext(ConfigContext);
}
