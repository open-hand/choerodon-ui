import React, { FunctionComponent, ReactNode, useCallback } from 'react';
import classNames from 'classnames';
import { getConfig } from 'choerodon-ui/lib/configure';
import { hide, show } from '../tooltip/singleton';
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
  labelTooltip?: TextTooltip;
  children?: ReactNode;
}

const MultiLine: FunctionComponent<MultiLineProps> = (props) => {
  const { prefixCls, label, validationMessage, required, validationHidden, tooltip, labelTooltip, children } = props;
  const handleLabelMouseEnter = useCallback((e) => {
    const { currentTarget } = e;
    if (labelTooltip === TextTooltip.always || (labelTooltip === TextTooltip.overflow && isOverflow(currentTarget))) {
      show(currentTarget, { title: label, placement: 'right' });
    }
  }, [label, labelTooltip]);
  const handleFieldMouseEnter = useCallback((e) => {
    const { currentTarget } = e;
    if (validationMessage) {
      show(currentTarget, {
        title: validationMessage,
        placement: 'bottomLeft',
        theme: getConfig('validationTooltipTheme') || getConfig('tooltipTheme'),
      });
    } else if (tooltip === TextTooltip.always || (tooltip === TextTooltip.overflow && isOverflow(currentTarget))) {
      show(currentTarget, { title: children, placement: 'right' });
    }
  }, [tooltip, validationMessage, children]);
  return (
    <Row className={`${prefixCls}-multi`}>
      {
        label && (
          <Col
            span={8}
            className={classNames(`${prefixCls}-multi-label`, { [`${prefixCls}-multi-label-required`]: required })}
            onMouseEnter={handleLabelMouseEnter}
            onMouseLeave={hide}
          >
            {label}
          </Col>
        )
      }
      <Col
        span={label ? 16 : 24}
        className={classNames(`${prefixCls}-multi-value`, { [`${prefixCls}-multi-value-invalid`]: !validationHidden })}
        onMouseEnter={handleFieldMouseEnter}
        onMouseLeave={hide}
      >
        {
          children
        }
      </Col>
    </Row>
  );
};

MultiLine.displayName = 'MultiLine';

export default MultiLine;
