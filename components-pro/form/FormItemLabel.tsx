import React, { CSSProperties, FunctionComponent, memo, ReactNode, useCallback, useContext, useEffect, useRef } from 'react';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { Tooltip as LabelTooltip } from '../core/enum';
import isOverflow from '../overflow-tip/util';
import { hide, show } from '../tooltip/singleton';

export interface FormLabelProps {
  className?: string;
  rowSpan?: number;
  children?: ReactNode;
  style?: CSSProperties;
  tooltip?: LabelTooltip;
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
