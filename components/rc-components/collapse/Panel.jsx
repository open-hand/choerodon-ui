import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import PanelContent from './PanelContent';
import Animate from '../../animate';
import { DataSetEvents } from 'choerodon-ui/dataset/data-set/enum';

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
    eventKey,
    dataSet,
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
      onItemClick(eventKey);
    }
  }, [onItemClick, eventKey]);
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
      handleItemClick();
    }
  }, [handleItemClick]);

  const icon = showArrow ? (
    <span className={`${prefixCls}-expand-icon-wrapper`} onClick={trigger === 'icon' ? handleItemClick : undefined}>
      {typeof expandIcon === 'function' ? expandIcon(props) : <i className={iconCls} />}
    </span>
  ) : null;

  const wrapRef = useRef(null);
  const dsList = dataSet ? [].concat(dataSet) : [];
  const { length } = dsList;

  useEffect(() => {
    if (length && !disabled && !isActive) {
      const handleValdate = ({ valid }) => {
        if (!valid) {
          handleItemClick();
          const { current } = wrapRef;
          if (current) {
            current.focus();
          }
        }
      };
      dsList.forEach(ds => ds.addEventListener(DataSetEvents.validate, handleValdate));
      return () => dsList.forEach(ds => ds.removeEventListener(DataSetEvents.validate, handleValdate));
    }
  }, [isActive, disabled, handleItemClick, length, ...dsList]);

  return (
    <div className={itemCls} style={style} id={id} ref={wrapRef} tabIndex={-1}>
      <div
        className={headerCls}
        onClick={trigger === 'header' ? handleItemClick : undefined}
        role={accordion ? 'tab' : 'button'}
        tabIndex={disabled ? -1 : 0}
        aria-expanded={`${isActive}`}
        onKeyPress={handleKeyPress}
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
