import * as React from 'react';
import warning from 'choerodon-ui/lib/_util/warning';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import Base from './Base';
import { BlockProps, EllipsisConfig } from './interface';
import { FormField, FormFieldProps } from '../field/FormField';

export interface TextProps extends BlockProps, FormFieldProps<any> {
  ellipsis?: boolean | Omit<EllipsisConfig, 'expandable' | 'rows' | 'onExpand'>;
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

@observer
export default class Text extends FormField<TextProps> {

  static displayName = 'Text';

  static __PRO_TEXT = true;

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'text',
  };

  get mergedEllipsis(): boolean | EllipsisConfig | undefined {
    const { ellipsis } = this.props;
    if (ellipsis && typeof ellipsis === 'object') {
      return omit(ellipsis as any, ['expandable', 'rows']);
    }

    return ellipsis;
  }

  renderWrapper(): React.ReactNode {
    const { ellipsis, children, ...restProps } = this.props;
    warning(
      typeof ellipsis !== 'object' ||
      !ellipsis ||
      (!('expandable' in ellipsis) && !('rows' in ellipsis)),
      'Typography.Text `ellipsis` do not support `expandable` or `rows` props.',
    );
    const floatLabel = this.renderFloatLabel();
    return floatLabel ? (
      <span {...this.getWrapperProps()}>
        {floatLabel}
        <Base {...restProps} ellipsis={this.mergedEllipsis} component="span">
          {this.processRenderer(this.getValue()) || children}
        </Base>
      </span>
    ) : (
      <Base {...restProps} ellipsis={this.mergedEllipsis} component="span">
        {this.processRenderer(this.getValue()) || children}
      </Base>
    );
  }
}
