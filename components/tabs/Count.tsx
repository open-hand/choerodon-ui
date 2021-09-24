import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import isNil from 'lodash/isNil';

export interface CountProps {
  prefixCls?: string;
  count?: number | (() => number | undefined);
  overflowCount?: number;
}

function getCount(count: number | (() => number | undefined) | undefined): number | undefined {
  if (typeof count === 'function') {
    return count();
  }
  return count;
}

const Count: FunctionComponent<CountProps> = observer(function Count(props) {
  const { count, overflowCount, prefixCls } = props;
  const number = getCount(count);
  if (!number) {
    return null;
  }
  const displayCount = number > (overflowCount as number) ? `${overflowCount}+` : number;
  if (isNil(displayCount)) {
    return null;
  }
  return <span className={`${prefixCls}-tab-count`}>{displayCount}</span>;
});

Count.displayName = 'Count';

export default Count;
