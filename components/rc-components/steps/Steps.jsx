/* eslint react/no-did-mount-set-state: 0 */
import React, { useCallback, useRef } from 'react';
import StepGroup from './StepGroup';

const Steps = function Steps(props) {
  const _stepIndex = useRef(0);

  const setNumberChange = useCallback((index) => {
    _stepIndex.current = index;
  }, []);

  const getNumberChange = useCallback(() => _stepIndex.current, []);

  return (
    <StepGroup {...props} setNumberChange={setNumberChange} getNumberChange={getNumberChange} />
  );
};

Steps.displayName = 'RcSteps';

export default Steps;
