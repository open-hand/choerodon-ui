import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { ReactQuillProps } from 'react-quill/lib';
import 'react-quill/dist/quill.snow.css';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import { Delta } from './quill';
import ObserverFormField from '../field';
import DataSet from '../data-set/DataSet';
import { FormFieldProps } from '../field/FormField';
import autobind from '../_util/autobind';
import BaseEditor from './BaseEditor';
import RichTextViewer from './RichTextViewer';
import { randomWord } from './utils';
import { RichTextMode, RichTextToolbarType } from './enum';

export interface RichTextToolbarHookProps {
  id?: string;
  dataSet?: DataSet;
}

export type RichTextToolbarHook = (props: RichTextToolbarHookProps) => ReactNode;

export interface RichTextProps extends FormFieldProps {
  options?: ReactQuillProps;
  mode?: RichTextMode;
  toolbar?: RichTextToolbarType | RichTextToolbarHook;
}

const defaultRichTextOptions: ReactQuillProps = {
  theme: 'snow',
};

@observer
export default class RichText extends ObserverFormField<RichTextProps> {
  static displayName = 'RichText';

  static RichTextViewer = RichTextViewer;

  static propTypes = {
    options: PropTypes.object,
    mode: PropTypes.oneOf([RichTextMode.editor, RichTextMode.preview]),
    toolbar: PropTypes.oneOfType([
      PropTypes.oneOf([
        RichTextToolbarType.none,
        RichTextToolbarType.normal,
      ]),
      PropTypes.func,
    ]),
    ...ObserverFormField.propTypes,
  };

  static defaultProps = {
    ...ObserverFormField.defaultProps,
    suffixCls: 'rich-text',
    autoFocus: false,
    mode: 'editor',
    toolbar: RichTextToolbarType.normal,
  };

  editor: any;

  toolbarId: string = randomWord(false, 32, 64);

  rtOptions: ReactQuillProps = this.getRichTextOptions();


  getRichTextOptions(options: ReactQuillProps = this.props.options!): ReactQuillProps {
    if (options) {
      if (options.modules && options.modules.imageDropAndPaste !== false) {
        options.modules.imageDropAndPaste = true;
      }
    } else {
      options = {
        modules: {
          toolbar: {
            container: `#${this.toolbarId}`,
          },
          imageDropAndPaste: true,
        },
      };
    }
    return { ...defaultRichTextOptions, ...options };
  }

  getOtherProps() {
    return omit(super.getOtherProps(), ['defaultValue', 'value', 'disabled']);
  }

  @autobind
  handleChange(value: Delta) {
    this.setValue(value);
  }

  // 禁用与只读表现一致
  // @autobind
  // setDisabled(disabled) {
  //   if(this.element && this.element.editor) {
  //     this.element.editor.getEditor().enable(!disabled);
  //   }
  // }

  componentWillReceiveProps(nextProps, nextContext) {
    const { options } = nextProps;
    if (!isEqual(options, this.props.options)) {
      this.rtOptions = this.getRichTextOptions(options);
    }
    super.componentWillReceiveProps(nextProps, nextContext);
  }

  renderWrapper(): ReactNode {
    const { defaultValue, dataSet } = this.props;
    this.rtOptions.readOnly = this.isDisabled() ? true : this.isReadOnly();
    const deltaOps = this.getValue() || defaultValue;
    return (
      <div {...this.getWrapperProps()}>
        <BaseEditor
          {...this.getOtherProps()}
          {...this.rtOptions}
          toolbarId={this.toolbarId}
          value={toJS(deltaOps)}
          dataSet={dataSet}
        />
        {this.renderFloatLabel()}
      </div>
    );
  }
}
