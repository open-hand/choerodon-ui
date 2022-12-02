import React, { CSSProperties, FunctionComponent, memo, ReactNode, useCallback, useContext, useEffect, useRef } from 'react';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { isArrayLike } from 'mobx';
import { Tooltip as LabelTooltip } from '../core/enum';
import isOverflow from '../overflow-tip/util';
import { hide, show } from '../tooltip/singleton';
import { TooltipProps } from '../tooltip/Tooltip';

export interface FormLabelProps {
  className?: string;
  rowSpan?: number;
  children?: ReactNode;
  style?: CSSProperties;
  tooltip?: LabelTooltip | [LabelTooltip, TooltipProps];
  help?: ReactNode;
}

const FormItemLabel: FunctionComponent<FormLabelProps> = function FormItemLabel(props) {
  const { className, rowSpan, style, tooltip, children, help } = props;
  const { getTooltipTheme, getTooltipPlacement } = useContext(ConfigContext);
  const tooltipRef = useRef<boolean>(false);
  const handleMouseEnter = useCallback((e) => {
    const { currentTarget } = e;
    if (tooltip === LabelTooltip.always || (tooltip === LabelTooltip.overflow && isOverflow(currentTarget))) {
      show(currentTarget, {
        title: children,
        theme: getTooltipTheme('label'),
        placement: getTooltipPlacement('label'),
      });
      tooltipRef.current = true;
    } else if (isArrayLike(tooltip)) {
      const tooltipType = tooltip[0];
      const labelTooltipProps = tooltip[1] || {};
      const duration: number = (labelTooltipProps.mouseEnterDelay || 0.1) * 1000;
      if (tooltipType === LabelTooltip.always || (tooltipType === LabelTooltip.overflow && isOverflow(currentTarget))) {
        show(currentTarget, {
          theme: getTooltipTheme('label'),
          placement: getTooltipPlacement('label'),
          title: labelTooltipProps.title ? labelTooltipProps.title : children,
          ...labelTooltipProps,
        }, duration);
        tooltipRef.current = true;
      }
    }
  }, [tooltip, children, tooltipRef]);
  const handleMouseLeave = useCallback(() => {
    if (tooltipRef.current) {
      hide();
      tooltipRef.current = false;
    }
  }, [tooltipRef]);
  useEffect(() => () => {
    if (tooltipRef.current) {
      hide();
      tooltipRef.current = false;
    }
  }, [tooltipRef]);

  return (
    <td
      className={className}
      rowSpan={rowSpan}
      style={style}
    >
      <label>
        <span
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </span>
        {help}
      </label>
    </td>
  );
};

FormItemLabel.displayName = 'FormItemLabel';

export default memo(FormItemLabel);
