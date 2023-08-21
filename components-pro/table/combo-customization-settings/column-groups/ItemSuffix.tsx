import React, { FunctionComponent, useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Button from '../../../button/Button';
import { ButtonColor, ButtonTooltip, FuncType } from '../../../button/enum';
import { Size } from '../../../core/enum';
import TableContext from '../../TableContext';
import Record from '../../../data-set/Record';
import { ColumnLock } from '../../enum';
import { $l } from '../../../locale-context';
import Tooltip from '../../../tooltip';


export interface ItemSuffixProps {
  records: Record[],
  record: Record;
}

const ItemSuffix: FunctionComponent<ItemSuffixProps> = function ItemSuffix(props) {
  const { records, record} = props;
  const { tableStore: { columnHideable, columnDraggable } } = useContext(TableContext);
  const changeLock = useCallback((lock: ColumnLock | false) => {
    const sort = record.get('sort');
    record.set('lock', lock);
    if (!lock) {
      records.forEach((r) => {
        if (r.get('sort') > sort) {
          r.set('lock', lock);
        }
      })
    } else {
      records.forEach((r) => {
        if (r.get('sort') < sort) {
          r.set('lock', lock);
        }
      })
    }
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
            <Tooltip title={$l('Table', 'lock_column')}>
              <Button
                funcType={FuncType.flat}
                color={ButtonColor.primary}
                size={Size.small}
                icon="lock-o"
                onClick={() => changeLock(false)}
              />
            </Tooltip>
          );
        }
        return (
          <Tooltip title={$l('Table', 'cancel_lock_column')}>
            <Button
              funcType={FuncType.flat}
              size={Size.small}
              icon="lock_open"
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
      <Tooltip title={record.get('hidden') === false ? $l('Table', 'show') : $l('Table', 'hide')}>
        <Button
          funcType={FuncType.flat}
          color={record.get('hidden') === false ? ButtonColor.primary : ButtonColor.default}
          size={Size.small}
          disabled={!columnHideable || record.get('hideable') === false || (record.parent && record.parent.get('hidden'))}
          icon={record.get('hidden') === false ? 'visibility' : 'visibility_off'}
          onClick={() => changeHidden(!record.get('hidden'))}
        />
      </Tooltip>
    </>
  );
};

ItemSuffix.displayName = 'ItemSuffix';

export default observer(ItemSuffix);
