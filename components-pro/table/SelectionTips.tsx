import React, { FunctionComponent, useCallback, useContext } from 'react';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { $l } from '../locale-context';
import TableContext from './TableContext';
import Tooltip from '../tooltip';
import Icon from '../icon';

const SelectionTips: FunctionComponent<any> = observer(() => {
  const { tableStore } = useContext(TableContext);
  const { prefixCls, dataSet, showCachedSelection } = tableStore;
  const handleSwitch = useCallback(action(() => {
    tableStore.showCachedSelection = !showCachedSelection;
  }), [showCachedSelection]);
  return (
    <div className={`${prefixCls}-selection-tips`}>
      <span>
        {$l('Table', 'selection_tips', { count: <b>{dataSet.selected.length}</b> })}
      </span>
      {
        dataSet.cacheSelectionKeys && dataSet.cachedSelected.length > 0 && (
          (
            <Tooltip
              title={$l('Table', showCachedSelection ? 'hide_cached_seletion' : 'show_cached_seletion')}
            >
              <Icon type={showCachedSelection ? 'visibility_off' : 'visibility'} onClick={handleSwitch} />
            </Tooltip>
          )
        )
      }
    </div>
  );
});

SelectionTips.displayName = 'SelectionTips';

export default SelectionTips;
