import React, { useCallback } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import PanelContent from './PanelContent';
import Animate from '../../animate';

const CollapsePanel = function CollapsePanel(props) {
  const {
    className,
    id,
    style,
    prefixCls,
    header,
    headerClass,
    children,
    isActive,
    showArrow,
    destroyInactivePanel,
    disabled,
    accordion,
    forceRender,
    expandIcon,
    expandIconPosition,
    extra,
    trigger,
    openAnimation,
    onItemClick,
  } = props;
  const headerCls = classNames(`${prefixCls}-header`, headerClass, {
    [`${prefixCls}-item-expand-renderer`]: showArrow && typeof expandIcon === 'function',
  });
  const itemCls = classNames(`${prefixCls}-item`, {
    [`${prefixCls}-item-active`]: isActive,
    [`${prefixCls}-item-disabled`]: disabled,
  }, className);

  const iconCls = classNames(`${prefixCls}-expand-icon`, {
    [`${prefixCls}-expanded`]: isActive,
    [`${prefixCls}-collapsed`]: !isActive,
  });
  const handleItemClick = useCallback(() => {
    if (onItemClick) {
      onItemClick();
    }
  }, [onItemClick]);

  const icon = showArrow ? (
    <span className={`${prefixCls}-expand-icon-wrapper`} onClick={trigger === 'icon' ? handleItemClick : undefined}>
      {typeof expandIcon === 'function' ? expandIcon(props) : <i className={iconCls} />}
    </span>
  ) : null;

  return (
    <div className={itemCls} style={style} id={id}>
      <div
        className={headerCls}
        onClick={trigger === 'header' ? handleItemClick : undefined}
        role={accordion ? 'tab' : 'button'}
        tabIndex={disabled ? -1 : 0}
        aria-expanded={`${isActive}`}
      >
        {showArrow && expandIconPosition !== 'text-right' && icon}
        {header}
        {showArrow && expandIconPosition === 'text-right' && icon}
        {extra && (<div className={`${prefixCls}-extra`}>{extra}</div>)}
      </div>
      <Animate
        hiddenProp="isInactive"
        exclusive
        component=""
        animation={openAnimation}
      >
        <PanelContent
          prefixCls={prefixCls}
          isInactive={!isActive}
          destroyInactivePanel={destroyInactivePanel}
          forceRender={forceRender}
          role={accordion ? 'tabpanel' : null}
        >
          {children}
        </PanelContent>
      </Animate>
    </div>
  );
};

CollapsePanel.displayName = 'RcCollapsePanel';

CollapsePanel.defaultProps = {
  showArrow: true,
  isActive: false,
  destroyInactivePanel: false,
  forceRender: false,
};

export default CollapsePanel;
