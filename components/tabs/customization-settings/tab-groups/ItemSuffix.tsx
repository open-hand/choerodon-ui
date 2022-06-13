import React, { FunctionComponent, ReactElement, useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Button from 'choerodon-ui/pro/lib/button/Button';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import Dropdown from 'choerodon-ui/pro/lib/dropdown/Dropdown';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { Placements } from 'choerodon-ui/pro/lib/dropdown/enum';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import Tooltip from 'choerodon-ui/pro/lib/tooltip/Tooltip';
import Menu, { ClickParam, MenuProps } from '../../../menu';
import { Size } from '../../../_util/enum';
import TabsContext from '../../TabsContext';
import Icon from '../../../icon';

const { Item, SubMenu } = Menu;

export interface ItemSuffixProps {
  record: Record;
  records: Record[];
  index: number;
  defaultKey?: string | undefined;
  onDefaultKeyChange: (defaultKey: string) => void;
  groups: { value: ColumnLock | false; records: Record[] }[];
}

const ItemSuffix: FunctionComponent<ItemSuffixProps> = function ItemSuffix(props) {
  const { record, defaultKey, onDefaultKeyChange } = props;
  const { prefixCls, tabCountHideable, defaultChangeable, tabTitleEditable } = useContext(TabsContext);
  const itemKey = record.get('key');
  const showCount = record.get('showCount');
  const handleMenuClick = useCallback((arg: ClickParam) => {
    switch (arg.key) {
      case 'set_default':
        onDefaultKeyChange(itemKey);
        break;
      case 'rename':
        record.setState('editing', true);
        break;
      case 'show_count_yes':
        record.set('showCount', true);
        break;
      case 'show_count_no':
        record.set('showCount', false);
        break;
      default:
    }
  }, [record, onDefaultKeyChange, itemKey]);
  const renderCheckOption = (bool: boolean) => {
    if (showCount === bool) {
      return <Icon type="check" style={{ float: 'right' }} />;
    }
  };
  const getTreeNodesMenus = (): ReactElement<MenuProps> | undefined => {
    const menus: ReactElement<any>[] = [];
    if (defaultChangeable && !record.get('disabled') && itemKey !== defaultKey) {
      menus.push(
        <Item key="set_default">
          <span>{$l('Tabs', 'set_default')}</span>
          <Tooltip title={$l('Tabs', 'set_default_tip')}>
            <Icon type="help" className={`${prefixCls}-tip`} />
          </Tooltip>
        </Item>);
    }
    if (tabTitleEditable) {
      menus.push(
        <Item key="rename">{$l('Tabs', 'rename')}</Item>,
      );
    }
    if (tabCountHideable) {
      menus.push(
        <SubMenu key="show_count" title={$l('Tabs', 'show_count')}>
          <Item key="show_count_yes">
            <span>{$l('Tabs', 'yes')}</span>
            {renderCheckOption(true)}
          </Item>
          <Item key="show_count_no">
            <span>{$l('Tabs', 'no')}</span>
            {renderCheckOption(false)}
          </Item>
        </SubMenu>,
      );
    }
    if (menus.length) {
      return (
        <Menu prefixCls={`${prefixCls}-dropdown-menu`} onClick={handleMenuClick} mode="vertical">
          {menus}
        </Menu>
      );
    }
  };
  const menu = getTreeNodesMenus();
  return menu ? (
    <Dropdown overlay={menu} placement={Placements.bottomRight}>
      <Button
        funcType={FuncType.flat}
        size={Size.small}
        icon="more_horiz"
        className={`${prefixCls}-customization-group-item-hover-button`}
      />
    </Dropdown>
  ) : null;
};

ItemSuffix.displayName = 'ItemSuffix';

export default observer(ItemSuffix);
