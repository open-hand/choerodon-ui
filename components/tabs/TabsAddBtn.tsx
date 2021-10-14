import React, { FunctionComponent, MouseEvent, MouseEventHandler, useCallback } from 'react';
import classnames from 'classnames';
import { getPrefixCls } from '../configure';
import { TabsProps } from './Tabs';
import Icon from '../icon';

interface TabsAddBtnProps extends TabsProps {
  extraPrefixCls?: string;
  vertical?: boolean;
}

const TabsAddBtn: FunctionComponent<TabsAddBtnProps> = function TabsAddBtn(props) {
  const { onEdit, prefixCls: customizePrefixCls, extraPrefixCls, vertical = false } = props;

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
    [`${prefixCls}-nav-vertical-add`]: vertical,
  });

  return (
    <div className={classes} style={{ display: extraPrefixCls || 'block' }} onClick={createNewTab}>
      <Icon type="add" />
    </div>
  );
};

export default TabsAddBtn;
