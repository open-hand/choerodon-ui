import React, { FunctionComponent, memo, ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import isString from 'lodash/isString';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { Tooltip as LabelTooltip } from '../core/enum';
import isOverflow from '../overflow-tip/util';
import { hide, show } from '../tooltip/singleton';

export interface FormLabelProps {
  className?: string;
  rowSpan?: number;
  children?: ReactNode;
  paddingLeft?: string;
  tooltip?: LabelTooltip;
}

const FormItemLabel: FunctionComponent<FormLabelProps> = function FormItemLabel(props) {
  const { className, rowSpan, paddingLeft, tooltip, children } = props;
  const { getTooltipTheme, getTooltipPlacement } = useContext(ConfigContext);
  const tooltipRef = useRef<boolean>(false);
  const style = useMemo(() => paddingLeft ? { paddingLeft } : undefined, [paddingLeft]);
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <label title={isString(children) && ![LabelTooltip.always, LabelTooltip.overflow].includes(tooltip!) ? children : undefined}>
        <span>
          {children}
        </span>
      </label>
    </td>
  );
};

FormItemLabel.displayName = 'FormItemLabel';

export default memo(FormItemLabel);
