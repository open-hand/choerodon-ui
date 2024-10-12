import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable, toJS } from 'mobx';
import { ReactQuillProps } from 'react-quill/lib';
import 'react-quill/dist/quill.snow.css';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
import { Delta } from './quill';
import DataSet from '../data-set/DataSet';
import { showValidationMessage } from '../field/utils';
import { ShowValidation } from '../form/enum';
import { FormField, FormFieldProps } from '../field/FormField';
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
  /**
   * 是否显示边框
   * @default true
   */
  border?: boolean;
  showValidation?: ShowValidation;
}

const defaultRichTextOptions: ReactQuillProps = {
  theme: 'snow',
};

@observer
export default class RichText extends FormField<RichTextProps> {
  static displayName = 'RichText';

  static Quill = BaseEditor.Quill;

  static RichTextViewer = RichTextViewer;

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'rich-text',
    autoFocus: false,
    mode: 'editor',
    border: true,
    toolbar: RichTextToolbarType.normal,
  };

  editor: any;

  @observable focused: boolean;

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

  get border(): boolean | undefined {
    return this.props.border;
  }

  
  showTooltip(e): boolean {
    if (this.showValidation === ShowValidation.tooltip) {
      const message = this.getTooltipValidationMessage();
      if (message) {
        showValidationMessage(e, message, this.context.getTooltipTheme('validation'), this.context.getTooltipPlacement('validation'), this.getContextConfig);
        return true;
      }
    }
    return false;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'defaultValue',
      'value',
      'border',
    ]);
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    delete otherProps.disabled;
    return otherProps;
  }

  @autobind
  handleChange(value: Delta) {
    if (value && Number(value.length) === 1 && value[0].insert === '\n') {
      this.setValue(null);
    } else {
      this.setValue(value);
    }
  }

  // 禁用与只读表现一致
  // @autobind
  // setDisabled(disabled) {
  //   if(this.element && this.element.editor) {
  //     this.element.editor.getEditor().enable(!disabled);
  //   }
  // }

  @autobind
  elementReference(node) {
    if (node && node.editor) {
      this.element = node.editor;
    }
  }

  getWrapperClassNames(...args): string {
    const { prefixCls, border, focused } = this;
    return super.getWrapperClassNames(
      {
        [`${prefixCls}-border`]: border,
        [`${prefixCls}-focused`]: focused,
      },
      ...args,
    );
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { options } = nextProps;
    if (!isEqual(options, this.props.options)) {
      this.rtOptions = this.getRichTextOptions(options);
    }
    super.componentWillReceiveProps(nextProps, nextContext);
  }

  @autobind
  @action
  handleRichTextBlur(props) {
    const { onBlur = noop, defaultValue } = this.props;
    this.focused = false;
    onBlur(props);
    const deltaOps = this.getValue() || defaultValue || [];
    if (props.length === 0 && props.index === 0 && deltaOps.length === 0) {
      this.setValue(null);
    }
  }

  @autobind
  @action
  handleRichTextFocus(props) {
    const { onFocus = noop } = this.props;
    if (!this.disabled) this.focused = true;
    onFocus(props);
  }

  renderWrapper(): ReactNode {
    const { defaultValue, dataSet } = this.props;
    this.rtOptions.readOnly = this.disabled || this.readOnly;
    const deltaOps = this.getValue() || defaultValue;
    return (
      <div
        {...this.getWrapperProps()}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <BaseEditor
          {...this.getOtherProps()}
          {...this.rtOptions}
          saveRef={this.getOtherProps().ref}
          toolbarId={this.toolbarId}
          value={toJS(deltaOps)}
          dataSet={dataSet}
          onBlur={this.handleRichTextBlur}
          onFocus={this.handleRichTextFocus}
        />
        {this.renderFloatLabel()}
      </div>
    );
  }
}
