import React, { FunctionComponent, ReactNode, useCallback, useMemo } from 'react';
import isString from 'lodash/isString';
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

const FormItemLabel: FunctionComponent<FormLabelProps> = (props) => {
  const { className, rowSpan, paddingLeft, tooltip, children } = props;
  const style = useMemo(() => paddingLeft ? { paddingLeft } : undefined, [paddingLeft]);
  const handleMouseEnter = useCallback((e) => {
    const { currentTarget } = e;
    if (tooltip === LabelTooltip.always || (tooltip === LabelTooltip.overflow && isOverflow(currentTarget))) {
      show(currentTarget, {
        title: children,
      });
    }
  }, [tooltip, children]);
  const handleMouseLeave = useCallback(() => hide(), []);
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

export default FormItemLabel;
