import React, { FunctionComponent, memo, ReactNode, useCallback, useContext, useEffect, useRef } from 'react';
import classNames from 'classnames';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { hide, show } from '../tooltip/singleton';
import { TooltipProps } from '../tooltip/Tooltip';
import Row from '../row';
import Col from '../col';
import { Tooltip as TextTooltip } from '../core/enum';
import isOverflow from '../overflow-tip/util';

export interface MultiLineProps {
  prefixCls?: string;
  label?: ReactNode;
  validationMessage?: ReactNode;
  required?: boolean;
  validationHidden?: boolean;
  tooltip?: TextTooltip;
  labelTooltip?: TextTooltip | [TextTooltip, TooltipProps];
  children?: ReactNode;
}

const MultiLine: FunctionComponent<MultiLineProps> = function MultiLine(props) {
  const { getTooltip, getTooltipTheme, getTooltipPlacement } = useContext(ConfigContext);
  const { prefixCls, label, validationMessage, required, validationHidden, tooltip = getTooltip('output'), labelTooltip, children } = props;
  const tooltipRef = useRef<boolean>(false);
  const handleLabelMouseEnter = useCallback((e) => {
    const { currentTarget } = e;
    if (labelTooltip === TextTooltip.always || (labelTooltip === TextTooltip.overflow && isOverflow(currentTarget))) {
      show(currentTarget, { title: label, placement: 'right' });
      tooltipRef.current = true;
    }
  }, [label, labelTooltip, tooltipRef]);
  const handleFieldMouseEnter = useCallback((e) => {
    const { currentTarget } = e;
    if (validationMessage) {
      show(currentTarget, {
        title: validationMessage,
        placement: getTooltipPlacement('validation') || 'bottomLeft',
        theme: getTooltipTheme('validation'),
      });
      tooltipRef.current = true;
    } else if (tooltip === TextTooltip.always || (tooltip === TextTooltip.overflow && isOverflow(currentTarget))) {
      show(currentTarget, { title: children, placement: 'right' });
      tooltipRef.current = true;
    }
  }, [tooltip, validationMessage, children, tooltipRef]);
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
    <Row className={`${prefixCls}-multi`}>
      {
        label && (
          <Col
            span={8}
            className={classNames(`${prefixCls}-multi-label`, { [`${prefixCls}-multi-label-required`]: required })}
            onMouseEnter={handleLabelMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {label}
          </Col>
        )
      }
      <Col
        span={label ? 16 : 24}
        className={classNames(`${prefixCls}-multi-value`, { [`${prefixCls}-multi-value-invalid`]: !validationHidden })}
        onMouseEnter={handleFieldMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {
          children
        }
      </Col>
    </Row>
  );
};

MultiLine.displayName = 'MultiLine';

export default memo(MultiLine);
