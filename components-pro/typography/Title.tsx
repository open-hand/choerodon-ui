import * as React from 'react';
import warning from 'choerodon-ui/lib/_util/warning';
import { observer } from 'mobx-react';
import Base from './Base';
import { BlockProps } from './interface';
import { FormField, FormFieldProps } from '../field/FormField';

const tupleNum = <T extends number[]>(...args: T) => args;

const TITLE_ELE_LIST = tupleNum(1, 2, 3, 4, 5);

export interface TitleProps extends BlockProps, FormFieldProps,
  Omit<{ level?: typeof TITLE_ELE_LIST[number] }, 'strong'> {
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

@observer
export default class Title extends FormField<TitleProps> {
  static displayName = 'Title';

  static __PRO_TEXT = true;

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'title',
  };

  renderWrapper(): React.ReactNode {
    const { level = 1, children, ...restProps } = this.props;
    let component: string;

    if (TITLE_ELE_LIST.indexOf(level) !== -1) {
      component = `h${level}`;
    } else {
      warning(
        false,
        'Typography.Title Title only accept `1 | 2 | 3 | 4 | 5` as `level` value.',
      );
      component = 'h1';
    }

    const floatLabel = this.renderFloatLabel();

    return floatLabel ? (
      <span {...this.getWrapperProps()}>
        {floatLabel}
        <Base {...restProps} component={component}>
          {this.processRenderer(this.getValue()) || children}
        </Base>
      </span>
    ) : (
      <Base {...restProps} component={component}>
        {this.processRenderer(this.getValue()) || children}
      </Base>
    )
  }
}
