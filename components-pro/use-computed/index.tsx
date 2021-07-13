import { useMemo } from 'react';
import { computed } from 'mobx';
import { useComputed as useMobxComputed } from 'mobx-react-lite';

const useComputed = useMobxComputed || ((func, inputs = []) => {
  return useMemo(() => computed(func), inputs).get();
});

export default useComputed;
