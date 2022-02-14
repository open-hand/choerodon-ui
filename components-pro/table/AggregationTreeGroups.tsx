import React, { FunctionComponent, ReactElement, useContext } from 'react';
import { AggregationTreeProps } from './AggregationTree';
import TableContext from './TableContext';

export interface AggregationTreeGroupsProps {
  trees: ReactElement<AggregationTreeProps>[];
}

const AggregationTreeGroups: FunctionComponent<AggregationTreeGroupsProps> = function AggregationTreeGroups(props) {
  const { trees } = props;
  const { prefixCls } = useContext(TableContext);
  if (trees.length > 1) {
    return (
      <div className={`${prefixCls}-aggregation-groups`}>
        {trees.map((tree, index) => <div key={String(index)} className={`${prefixCls}-aggregation-groups-tree`}>{tree}</div>)}
      </div>
    );
  }
  return trees[0];
};

AggregationTreeGroups.displayName = 'AggregationTreeGroups';

export default AggregationTreeGroups;
