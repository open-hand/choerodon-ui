import React, { FunctionComponent, useCallback, useContext } from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
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

const { Item } = Menu;

export interface ItemSuffixProps {
  record: Record;
  records: Record[];
  index: number;
  groups: { value: ColumnLock | false, records: Record[] }[]
}

function findRecords(record: Record, groups: { value: ColumnLock | false, records: Record[] }[]): Record[] {
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

const ItemSuffix: FunctionComponent<ItemSuffixProps> = observer((props) => {
  const { record, index, records, groups } = props;
  const { tableStore: { columnHideable, prefixCls } } = useContext(TableContext);
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
      default:
    }
  }), [record, index, changeLock, changeIndex]);
  const getTreeNodesMenus = useCallback(() => {
    const lock = record.get('lock');
    return (
      <Menu onClick={handleMenuClick}>
        <Item key="rename">重新命名</Item>
        {
          !record.parent && (
            lock ? (
              <Item key="unlock">取消冻结</Item>
            ) : [
              <Item key="left">左侧冻结</Item>,
              <Item key="right">右侧冻结</Item>,
            ]
          )
        }
        {index > 1 && <Item key='top'>置顶</Item>}
        {index > 0 && <Item key="up">前置一列</Item>}
        {index < records.length - 1 && <Item key="down">后置一列</Item>}
      </Menu>
    );
  }, [record, index, records, handleMenuClick]);
  return (
    <>
      <Dropdown overlay={getTreeNodesMenus()} placement={Placements.bottomRight}>
        <Button funcType={FuncType.flat} size={Size.small} icon="more_horiz" className={`${prefixCls}-customization-tree-treenode-hover-button`} />
      </Dropdown>
      <Switch
        record={record}
        disabled={!columnHideable || record.get('hideable') === false || (record.parent && record.parent.get('hidden'))}
        name="hidden"
        value={false}
        unCheckedValue
      />
    </>
  );
});

ItemSuffix.displayName = 'ItemSuffix';

export default ItemSuffix;
