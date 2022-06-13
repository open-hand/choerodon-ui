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
import { Placements } from '../../../dropdown/enum';
import { $l } from '../../../locale-context';

const { Item } = Menu;

export interface ItemSuffixProps {
  record: Record;
  records: Record[];
  index: number;
  groups: { value: false | 'left' | 'right'; records: Record[] }[];
}

function findRecords(record: Record, groups: { value: false | 'left' | 'right'; records: Record[] }[]): Record[] {
  const { parent } = record;
  if (parent) {
    return parent.children || [];
  }
  const fixed = record.get('fixed');
  const group = groups.find(({ value }) => value === fixed);
  if (group) {
    return group.records;
  }
  return [];
}

const ItemSuffix: FunctionComponent<ItemSuffixProps> = function ItemSuffix(props) {
  const { record, index, records, groups } = props;
  const { tableStore: { columnHideable, columnTitleEditable, columnDraggable, proPrefixCls: prefixCls } } = useContext(TableContext);
  const changeFixed = useCallback((fixed: false | 'left' | 'right') => {
    const oldFixed = record.get('fixed');
    const group = groups.find(({ value }) => value === fixed);
    if (group) {
      record.set('sort', group.records.length);
    }
    record.set('fixed', fixed);
    const oldGroup = groups.find(({ value }) => value === oldFixed);
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
      case 'unfixed':
        changeFixed(false);
        break;
      case 'left':
        changeFixed('left');
        break;
      case 'right':
        changeFixed('right');
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
      default:
    }
  }), [record, index, changeFixed, changeIndex]);

  const getTreeNodesMenus = useCallback(() => {
    const fixed = record.get('fixed');
    const menus: ReactElement<any>[] = [];
    if (columnTitleEditable && record.get('titleEditable') !== false) {
      menus.push(<Item key="rename">{$l('Table', 'rename')}</Item>);
    }
    if (columnDraggable) {
      if (!record.parent) {
        if (fixed) {
          menus.push(<Item key="unfixed">{$l('Table', 'unlock')}</Item>);
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
    }
    if (menus.length) {
      return (
        <Menu prefixCls={`${prefixCls}-dropdown-menu`} onClick={handleMenuClick}>
          {menus}
        </Menu>
      );
    }
  }, [record, index, records, columnTitleEditable, columnDraggable, handleMenuClick]);

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
