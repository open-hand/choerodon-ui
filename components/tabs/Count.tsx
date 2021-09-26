import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';

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
  if (number) {
    return (
      <span className={`${prefixCls}-tab-count`}>
      {
        overflowCount && number > overflowCount ? `${overflowCount}+` : number
      }
      </span>
    );
  }
  return null;
});

Count.displayName = 'Count';

export default Count;
