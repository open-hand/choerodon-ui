import React, { FunctionComponent, ReactElement, useCallback, useContext } from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { ClickParam } from 'choerodon-ui/lib/menu';
import Button from '../../../button/Button';
import { FuncType } from '../../../button/enum';
import { Size } from '../../../core/enum';
import Dropdown from '../../../dropdown/Dropdown';
import Menu from '../../../menu';
import Switch from '../../../switch/Switch';
import TableContext from '../../TableContext';
import Record from '../../../data-set/Record';
import { ColumnLock } from '../../enum';
import { Placements } from '../../../dropdown/enum';
import { $l } from '../../../locale-context';

const { Item } = Menu;

export interface ItemSuffixProps {
  record: Record;
  records: Record[];
  index: number;
  groups: { value: ColumnLock | false; records: Record[] }[];
}

function findRecords(record: Record, groups: { value: ColumnLock | false; records: Record[] }[]): Record[] {
  const { parent } = record;
  if (parent) {
    return parent.children || [];
  }
  const lock = record.get('lock');
  const group = groups.find(({ value }) => value === lock);
  if (group) {
    return group.records;
  }
  return [];
}

const ItemSuffix: FunctionComponent<ItemSuffixProps> = function ItemSuffix(props) {
  const { record, index, records, groups } = props;
  const { prefixCls, tableStore: { columnHideable, columnTitleEditable, columnDraggable } } = useContext(TableContext);
  const changeLock = useCallback((lock: ColumnLock | false) => {
    const oldLock = record.get('lock');
    const group = groups.find(({ value }) => value === lock);
    if (group) {
      record.set('sort', group.records.length);
    }
    record.set('lock', lock);
    const oldGroup = groups.find(({ value }) => value === oldLock);
    if (oldGroup) {
      oldGroup.records.filter(r => r !== record).forEach((r, sort) => r.set('sort', sort));
    }
  }, [record, groups]);
  const changeIndex = useCallback((newIndex) => {
    const oldSort = record.get('sort');
    const list = findRecords(record, groups);
    const [removed] = list.splice(oldSort, 1);
    if (removed) {
      list.splice(newIndex, 0, removed);
    }
    list.forEach((r, sort) => r.set('sort', sort));
  }, [record, groups]);
  const handleMenuClick = useCallback(action((arg: ClickParam) => {
    const { key } = arg;
    switch (key) {
      case 'rename':
        record.setState('editing', true);
        break;
      case 'unlock':
        changeLock(false);
        break;
      case 'left':
        changeLock(ColumnLock.left);
        break;
      case 'right':
        changeLock(ColumnLock.right);
        break;
      case 'top':
        changeIndex(0);
        break;
      case 'up':
        changeIndex(index - 1);
        break;
      case 'down':
        changeIndex(index + 1);
        break;
      case 'bottom':
        changeIndex(findRecords(record, groups).length - 1);
        break;
      default:
    }
  }), [record, index, changeLock, changeIndex, groups]);
  const getTreeNodesMenus = () => {
    const lock = record.get('lock');
    const menus: ReactElement<any>[] = [];
    if (columnTitleEditable && record.get('titleEditable') !== false) {
      menus.push(<Item key="rename">{$l('Table', 'rename')}</Item>);
    }
    if (columnDraggable && record.get('draggable') !== false) {
      if (!record.parent) {
        if (lock) {
          menus.push(<Item key="unlock">{$l('Table', 'unlock')}</Item>);
        } else {
          menus.push(
            <Item key="left">{$l('Table', 'left_lock')}</Item>,
            <Item key="right">{$l('Table', 'right_lock')}</Item>,
          );
        }
      }
      if (index > 1) {
        menus.push(<Item key='top'>{$l('Table', 'top')}</Item>);
      }
      if (index > 0) {
        menus.push(<Item key="up">{$l('Table', 'up')}</Item>);
      }
      if (index < records.length - 1) {
        menus.push(<Item key="down">{$l('Table', 'down')}</Item>);
      }
      if (index < records.length - 2) {
        menus.push(<Item key="bottom">{$l('Table', 'bottom')}</Item>);
      }
    }
    if (menus.length) {
      return (
        <Menu prefixCls={`${prefixCls}-dropdown-menu`} onClick={handleMenuClick}>
          {menus}
        </Menu>
      );
    }
  };
  const menu = getTreeNodesMenus();
  return (
    <>
      {
        menu && (
          <Dropdown overlay={menu} placement={Placements.bottomRight}>
            <Button
              funcType={FuncType.flat}
              size={Size.small}
              icon="more_horiz"
              className={`${prefixCls}-customization-tree-treenode-hover-button`}
            />
          </Dropdown>
        )
      }
      <Switch
        record={record}
        disabled={!columnHideable || record.get('hideable') === false || (record.parent && record.parent.get('hidden'))}
        name="hidden"
        value={false}
        unCheckedValue
      />
    </>
  );
};

ItemSuffix.displayName = 'ItemSuffix';

export default observer(ItemSuffix);
