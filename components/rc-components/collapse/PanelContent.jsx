import React, { memo, useRef } from 'react';
import classnames from 'classnames';

const PanelContent = function PanelContent(props) {
  const { prefixCls, isInactive, children, destroyInactivePanel, forceRender, role } = props;
  const isActived = useRef();
  isActived.current = forceRender || isActived.current || !isInactive;
  if (!isActived.current) {
    return null;
  }
  const contentCls = classnames({
    [`${prefixCls}-content`]: true,
    [`${prefixCls}-content-active`]: !isInactive,
    [`${prefixCls}-content-inactive`]: isInactive,
  });
  const child = !forceRender && isInactive && destroyInactivePanel ? null : <div className={`${prefixCls}-content-box`}>{children}</div>;
  return (
    <div
      className={contentCls}
      role={role}
    >
      {child}
    </div>
  );
};

PanelContent.displayName = 'RcPanelContent';

export default memo(PanelContent, (props, nextProps) => !props.forceRender && props.isInactive && nextProps.isInactive);
