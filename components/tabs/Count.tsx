import React, { useEffect,FunctionComponent, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import isNil from 'lodash/isNil';
import  noop from 'lodash/noop';

export type CountRendererProps = {
  text: ReactNode;
  count: number | undefined;
  overflowCount: number | undefined;
}

export interface CountProps {
  prefixCls?: string;
  count?: number | (() => number | undefined);
  overflowCount?: number;
  renderer?: (props: CountRendererProps) => ReactNode;
  asyncCount: Function;
}

function getCount(count: number | (() => number | undefined) | undefined): number | undefined {
  if (typeof count === 'function') {
    return count();
  }
  return count;
}

function defaultRenderer(props: CountRendererProps): ReactNode {
  const { text } = props;
  if (text) {
    return text;
  }
}

const Count: FunctionComponent<CountProps> = function Count(props) {
  const { count, overflowCount, prefixCls, renderer = defaultRenderer, asyncCount = noop } = props;
  const number = getCount(count);
  
  useEffect(()=>{
    if (count !== number){
      asyncCount()
    }
  },[number])
  
  const renderedText: ReactNode = renderer({
    text: overflowCount && number && number > overflowCount ? `${overflowCount}+` : number,
    count: number,
    overflowCount,
  });
  if (!isNil(renderedText)) {
    return (
      <span className={`${prefixCls}-tab-count`}>
        {renderedText}
      </span>
    );
  }
  return null;
};

Count.displayName = 'Count';

export default observer(Count);
