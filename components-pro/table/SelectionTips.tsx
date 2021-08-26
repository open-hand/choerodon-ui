import React, { FunctionComponent, useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { action } from 'mobx';
import { $l } from '../locale-context';
import TableContext from './TableContext';
import Tooltip from '../tooltip';
import Button from '../button/Button';
import { FuncType } from '../button/enum';

const SelectionTips: FunctionComponent<any> = observer(function SelectionTips() {
  const { prefixCls, dataSet, tableStore, showSelectionCachedButton, onShowCachedSelectionChange } = useContext(TableContext);
  const { showCachedSelection } = tableStore;
  const handleSwitch = useCallback(action(() => {
    const newShowCachedSelection = !showCachedSelection;
    tableStore.showCachedSelection = newShowCachedSelection;
    if (onShowCachedSelectionChange) {
      onShowCachedSelectionChange(newShowCachedSelection);
    }
  }), [showCachedSelection, onShowCachedSelectionChange]);
  const cachedButton = showSelectionCachedButton && dataSet.cacheSelectionKeys && dataSet.cachedSelected.length > 0 ? (
    <Tooltip
      title={$l('Table', showCachedSelection ? 'hide_cached_seletion' : 'show_cached_seletion')}
    >
      <Button
        className={`${prefixCls}-switch`}
        funcType={FuncType.flat}
        icon={showCachedSelection ? 'visibility_off' : 'visibility'}
        onClick={handleSwitch}
      />
    </Tooltip>
  ) : null;
  return tableStore.showSelectionTips ? (
    <div className={`${prefixCls}-selection-tips`}>
      <span>
        {$l('Table', 'selection_tips', { count: <b>{dataSet.selected.length}</b> })}
      </span>
      {cachedButton}
    </div>
  ) : cachedButton;
});

SelectionTips.displayName = 'SelectionTips';

export default SelectionTips;
