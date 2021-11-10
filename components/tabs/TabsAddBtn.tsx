import React, { FunctionComponent, memo, MouseEvent, MouseEventHandler, useCallback, useContext } from 'react';
import classnames from 'classnames';
import { TabsProps } from './Tabs';
import Icon from '../icon';
import ConfigContext from '../config-provider/ConfigContext';

interface TabsAddBtnProps extends TabsProps {
  extraPrefixCls?: string;
  vertical?: boolean;
  isFixed?: boolean;
}

const TabsAddBtn: FunctionComponent<TabsAddBtnProps> = function TabsAddBtn(props) {
  const { getPrefixCls } = useContext(ConfigContext);
  const { onEdit, prefixCls: customizePrefixCls, extraPrefixCls, vertical = false, isFixed } = props;

  const prefixCls = getPrefixCls('tabs', customizePrefixCls);
  const createNewTab: MouseEventHandler<HTMLElement> = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (onEdit) {
        onEdit(e, 'add');
      }
    },
    [onEdit],
  );

  const classes = classnames(`${prefixCls}-nav-add`, {
    [`${prefixCls}-nav-add-fixed`]: isFixed,
    [`${prefixCls}-nav-vertical-add`]: vertical,
  });

  return (
    <div className={classes} style={{ display: extraPrefixCls || 'block' }} onClick={createNewTab}>
      <Icon type="add" />
    </div>
  );
};

TabsAddBtn.displayName = 'TabsAddBtn';

export default memo(TabsAddBtn);
