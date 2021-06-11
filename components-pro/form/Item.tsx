import React, { Children, cloneElement, FunctionComponent, isValidElement, ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import FormContext from './FormContext';
import { defaultLabelWidth, FIELD_SUFFIX, getProperty, normalizeLabelWidth } from './utils';
import { LabelLayout } from './enum';
import { FormFieldProps } from '../field/FormField';
import Row from '../row';
import Col from '../col';
import OverflowTip from '../overflow-tip';
import { Tooltip as LabelTooltip } from '../core/enum';

export interface ItemProps extends FormFieldProps {
  children: ReactElement<FormFieldProps>;
}

export interface IItem extends FunctionComponent<ItemProps> {
  __PRO_FORM_ITEM?: boolean;
}

const Item: IItem = observer((props: ItemProps): ReactElement<any> | null => {
  const { dataSet, record, labelLayout = getConfig('labelLayout'), labelAlign, labelWidth: contextLabelWidth = defaultLabelWidth, labelTooltip, useColon } = useContext(FormContext);
  const { children, useColon: fieldUseColon = useColon, ...rest } = props;
  const child = Children.only<ReactElement<FormFieldProps>>(children);
  if (isValidElement<FormFieldProps>(child)) {
    const prefixCls = getProPrefixCls(FIELD_SUFFIX);
    const { props: childrenProps } = child;
    const { className, fieldClassName, ...otherProps } = childrenProps;
    const fieldProps: FormFieldProps = { ...rest, ...otherProps };
    const fieldElementProps: any = {
      className: classNames(props.className, className, prefixCls),
      ...fieldProps,
    };
    if ([LabelLayout.none, LabelLayout.float, LabelLayout.placeholder].includes(labelLayout)) {
      return (
        <div className={`${prefixCls}-wrapper`}>
          {cloneElement<FormFieldProps>(child, fieldElementProps)}
        </div>
      );
    }
    const label = getProperty(fieldProps, 'label', dataSet, record);
    const required = getProperty(fieldProps, 'required', dataSet, record);
    const readOnly = getProperty(fieldProps, 'readOnly', dataSet, record);
    const isOutput = labelLayout === LabelLayout.horizontal && (child.type as any).displayName === 'Output';
    const labelClassName = classNames(`${prefixCls}-label`, `${prefixCls}-label-${labelAlign}`, fieldClassName, {
      [`${prefixCls}-required`]: required,
      [`${prefixCls}-readonly`]: readOnly,
      [`${prefixCls}-label-vertical`]: labelLayout === LabelLayout.vertical,
      [`${prefixCls}-label-output`]: isOutput,
      [`${prefixCls}-label-useColon`]: label && fieldUseColon,
    });
    const wrapperClassName = classNames(`${prefixCls}-wrapper`, {
      [`${prefixCls}-output`]: isOutput,
    });
    const tooltip = props.labelTooltip || labelTooltip;
    const isTooltip = tooltip && [LabelTooltip.always, LabelTooltip.overflow].includes(tooltip);
    if (labelLayout === LabelLayout.vertical) {
      const labelNode = (
        <label className={labelClassName}>{label}</label>
      );
      return (
        <>
          {
            isTooltip ? (
              <OverflowTip
                title={label}
                strict={tooltip === LabelTooltip.always}
              >
                {labelNode}
              </OverflowTip>
            ) : labelNode
          }
          <div className={wrapperClassName}>{cloneElement(child, fieldElementProps)}</div>
        </>
      );
    }
    const fieldLabelWidth = getProperty(fieldProps, 'labelWidth', dataSet, record);
    const columnLabelWidth = normalizeLabelWidth(contextLabelWidth, 1)[0];
    const labelWidth = columnLabelWidth === 'auto' ? undefined : Math.max(columnLabelWidth, isNaN(fieldLabelWidth) ? 0 : fieldLabelWidth);
    const labelNode = (
      <label className={labelClassName} style={{ width: labelWidth }}>{label}</label>
    );
    return (
      <Row className={`${prefixCls}-row`}>
        <Col className={`${prefixCls}-col`}>
          {
            isTooltip ? (
              <OverflowTip
                title={label}
                strict={tooltip === LabelTooltip.always}
              >
                {labelNode}
              </OverflowTip>
            ) : labelNode
          }
        </Col>
        <Col className={`${prefixCls}-col ${prefixCls}-col-control`}>
          <div className={wrapperClassName}>{cloneElement(child, fieldElementProps)}</div>
        </Col>
      </Row>
    );
  }
  if (child) {
    return child;
  }
  return null;
});

Item.displayName = 'FormItem';

Item.__PRO_FORM_ITEM = true;

export default Item;
