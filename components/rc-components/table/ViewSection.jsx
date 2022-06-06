import React, { forwardRef, useCallback, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

const ViewSection = forwardRef(function (props, forward) {
  const { onInViewChange } = props;
  const { ref: intersectionRef, inView } = useInView({
    root: null,
  });
  const ref = useCallback((node) => {
    forward(node);
    intersectionRef(node);
  }, [intersectionRef, forward]);
  useEffect(() => {
    onInViewChange(inView);
  }, [onInViewChange, inView]);
  return (
    <div {...props} ref={ref}/>
  );
});

ViewSection.displayName = 'ViewSection';

export default ViewSection;
