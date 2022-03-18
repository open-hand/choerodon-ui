import * as React from 'react';
import { observer } from 'mobx-react';
import Base from './Base';
import { BlockProps } from './interface';
import { FormField, FormFieldProps } from '../field/FormField';

export interface ParagraphProps extends BlockProps, FormFieldProps {
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

@observer
export default class Paragraph extends FormField<ParagraphProps>{
  static displayName = 'Paragraph';

  static __PRO_TEXT = true;

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'paragraph',
  };

  renderWrapper(): React.ReactNode {
    return (
      <>
        <Base {...this.props} component="div">
          {this.processRenderer(this.getValue()) || this.props.children}
        </Base>
        {this.renderFloatLabel()}
      </>
    )
  }
}
