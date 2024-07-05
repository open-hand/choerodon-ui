import * as React from 'react';
import { observer } from 'mobx-react';
import warning from 'choerodon-ui/lib/_util/warning';
import Base from './Base';
import { BlockProps } from './interface';
import { FormField, FormFieldProps } from '../field/FormField';

export interface LinkProps extends BlockProps, FormFieldProps<any> {
  ellipsis?: boolean;
  rel?: string;
  target?: string;
}

@observer
export default class Link extends FormField<LinkProps> {
  static displayName = 'Link';

  static __PRO_TEXT = true;

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'link',
  };

  renderWrapper(): React.ReactNode {
    const { ellipsis, rel, children, ...restProps } = this.props;
    warning(
      typeof ellipsis !== 'object',
      'Typography.Link `ellipsis` only supports boolean value.',
    );
    const mergedProps = {
      ...restProps,
      rel: rel === undefined && restProps.target === '_blank' ? 'noopener noreferrer' : rel,
    };
    const floatLabel = this.renderFloatLabel();

    return floatLabel ? (
      <span {...this.getWrapperProps()}>
        {floatLabel}
        <Base {...mergedProps} ellipsis={!!ellipsis} component="a">
          {this.processRenderer(this.getValue()) || children}
        </Base>
      </span>
    ) : (
      <Base {...mergedProps} ellipsis={!!ellipsis} component="a">
        {this.processRenderer(this.getValue()) || children}
      </Base>
    )
  }
}
