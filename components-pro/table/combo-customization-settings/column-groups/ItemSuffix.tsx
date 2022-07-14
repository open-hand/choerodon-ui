import React, { FunctionComponent, useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Button from '../../../button/Button';
import {ButtonTooltip, FuncType} from '../../../button/enum';
import { Size } from '../../../core/enum';
import TableContext from '../../TableContext';
import Record from '../../../data-set/Record';
import { ColumnLock } from '../../enum';
import { $l } from '../../../locale-context';
import Tooltip from '../../../tooltip';


export interface ItemSuffixProps {
  record: Record;
  index: number;
}

const ItemSuffix: FunctionComponent<ItemSuffixProps> = function ItemSuffix(props) {
  const { record, index } = props;
  const { tableStore: { columnHideable, columnDraggable } } = useContext(TableContext);
  const changeLock = useCallback((lock: ColumnLock | false) => {
    record.set('lock', lock);
  }, [record]);
  const changeHidden = useCallback((hidden: boolean) => {
    record.set('hidden', hidden);
  }, [record]);
  const getTreeNodes = () => {
    const lock = record.get('lock');
    if (columnDraggable && record.get('draggable') !== false) {
      if (!record.parent) {
        if (lock) {
          return (
            <Tooltip title={$l('Table', 'lock_first_column')}>
              <Button
                funcType={FuncType.flat}
                size={Size.small}
                icon="lock_open"
                onClick={() => changeLock(false)}
              />
            </Tooltip>
          );
        }
      }
      if (index === 0) {
        return (
          <Tooltip title={$l('Table', 'lock_first_column')}>
            <Button
              funcType={FuncType.flat}
              size={Size.small}
              icon="lock-o"
              onClick={() => changeLock(ColumnLock.left)}
              tooltip={ButtonTooltip.always}
            />
          </Tooltip>
        );
      }
    }
  };
  return (
    <>
      {getTreeNodes()}
      <Button
        funcType={FuncType.flat}
        size={Size.small}
        disabled={!columnHideable || record.get('hideable') === false || (record.parent && record.parent.get('hidden'))}
        icon={record.get('hidden') === false ? 'visibility_off' : 'visibility'}
        onClick={() => changeHidden(!record.get('hidden'))}
      />
    </>
  );
};

ItemSuffix.displayName = 'ItemSuffix';

export default observer(ItemSuffix);
