import React, { CSSProperties, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { action, observable } from 'mobx';
import { PropTypes as MobxPropTypes } from 'mobx-react';
import Trigger from '../trigger/Trigger';
import { Action } from '../trigger/enum';
import { TextField, TextFieldProps } from '../text-field/TextField';
import autobind from '../_util/autobind';
import Icon from '../icon';
import TaskRunner from '../_util/TaskRunner';
import BUILT_IN_PLACEMENTS from './placements';

export interface TriggerFieldPopupContentProps {
  setValue: (value) => void;
  setPopup: (hidden: boolean) => void;
}

export interface TriggerFieldProps<P extends TriggerFieldPopupContentProps = TriggerFieldPopupContentProps> extends TextFieldProps {
  /**
   * 下拉框的自定义内容
   */
  popupContent?: ReactNode | ((props: P) => ReactNode);
  /**
   * 下拉框的自定义样式名
   */
  popupCls?: string;
  /**
   * 下拉框的内链样式
   */
  popupStyle?: CSSProperties;
  /**
   * 下拉框对齐方式
   */
  popupPlacement?: string;
  /**
   * 触发下拉框的方式组
   * 可选值：click | focus | hover | contextMenu
   */
  trigger?: Action[];
  /**
   * 下拉框显示延迟
   * @defualt 150
   */
  triggerShowDelay?: number;
  /**
   * 下拉框隐藏延迟
   * @defualt 50
   */
  triggerHiddenDelay?: number;
  /**
   * 下拉框变化钩子
   */
  onPopupHiddenChange?: (hidden: boolean) => void;
  /**
   * 定义浮层的容器，默认为 body
   * @param triggerNode
   */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  /**
   * 当popup中有可获取焦点对象时，是否按tab键时获取焦点
   */
  tabIntoPopupContent?: boolean;

  viewMode?: 'popup' | 'modal';
}

export default abstract class TriggerField<T extends TriggerFieldProps> extends TextField<T & TriggerFieldProps> {
  static displayName = 'TriggerField';

  static propTypes = {
    /**
     * 下拉框的自定义内容
     */
    popupContent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /**
     * 下拉框的自定义样式名
     */
    popupCls: PropTypes.string,
    /**
     * 下拉框的内链样式
     */
    popupStyle: PropTypes.object,
    /**
     * 下拉框对齐方式
     */
    popupPlacement: PropTypes.string,
    /**
     * 触发下拉框的方式
     * 可选值：click | focus | hover | contextMenu
     */
    trigger: MobxPropTypes.arrayOrObservableArrayOf(PropTypes.string),
    /**
     * 下拉框显示延迟
     * @defualt 150
     */
    triggerShowDelay: PropTypes.number,
    /**
     * 下拉框隐藏延迟
     * @defualt 50
     */
    triggerHiddenDelay: PropTypes.number,
    /**
     * 下拉框变化钩子
     */
    onPopupHiddenChange: PropTypes.func,
    /**
     * 定义浮层的容器，默认为 body
     */
    getPopupContainer: PropTypes.func,
    /**
     * 当popup中有可获取焦点对象时，是否按tab键时获取焦点
     */
    tabIntoPopupContent: PropTypes.bool,

    viewMode: PropTypes.oneOf(['none', 'popup', 'modal', 'list']),
    ...TextField.propTypes,
  };

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'trigger',
    clearButton: true,
    popupPlacement: 'bottomLeft',
    trigger: ['focus', 'click'],
    triggerShowDelay: 150,
    triggerHiddenDelay: 50,
    viewMode: 'popup',
  };

  popupTask: TaskRunner = new TaskRunner();

  trigger: Trigger | null;

  @observable statePopup: boolean;

  get popup(): boolean {
    return this.statePopup;
  }

  constructor(props, context) {
    super(props, context);
    this.setPopup(false);
  }

  @autobind
  saveTrigger(node) {
    this.trigger = node;
  }

  @autobind
  isValidationMessageHidden(message?: ReactNode): boolean {
    return super.isValidationMessageHidden(message) || this.popup;
  }

  @action
  setPopup(statePopup: boolean) {
    this.statePopup = statePopup;
  }

  abstract getTriggerIconFont(): string;

  abstract handlePopupAnimateAppear(key): void;

  abstract handlePopupAnimateEnd(key, exists): void;

  abstract getPopupStyleFromAlign(target): CSSProperties | undefined;

  abstract getPopupContent(): ReactNode;

  @autobind
  getRootDomNode() {
    return findDOMNode(this);
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'popupContent',
      'popupCls',
      'popupStyle',
      'popupPlacement',
      'editable',
      'trigger',
      'triggerShowDelay',
      'triggerHiddenDelay',
      'onPopupHiddenChange',
      'getPopupContainer',
      'extraFooterPlacement',
      'renderExtraFooter',
      'treeDefaultExpandedKeys',
      'treeDefaultExpandAll',
      'tabIntoPopupContent',
      'viewMode',
    ]);
  }

  getPopupProps(): TriggerFieldPopupContentProps {
    return {
      setValue: this.setValue.bind(this),
      setPopup: this.setPopup.bind(this),
    };
  }

  getPopupClassName(defaultClassName: string | undefined): string | undefined {
    return defaultClassName;
  }

  @autobind
  renderPopupContent() {
    const { popupContent } = this.props;
    if (popupContent === undefined) {
      return this.getPopupContent();
    }
    if (popupContent instanceof Function) {
      return popupContent(this.getPopupProps());
    }
    return popupContent;
  }

  getWrappedEditor(renderedValue?: ReactNode) {
    const {
      prefixCls,
      props: {
        popupCls,
        popupStyle,
        popupPlacement,
        hidden,
        trigger,
        triggerShowDelay,
        triggerHiddenDelay,
        getPopupContainer,
        tabIntoPopupContent,
      },
    } = this;
    return (
      <Trigger
        ref={this.saveTrigger}
        action={this.readOnly || this.disabled ? [] : trigger}
        focusDelay={triggerShowDelay}
        blurDelay={triggerHiddenDelay}
        mouseEnterDelay={triggerShowDelay}
        mouseLeaveDelay={triggerHiddenDelay}
        prefixCls={prefixCls}
        popupCls={this.getPopupClassName(popupCls)}
        popupStyle={popupStyle}
        popupContent={this.renderPopupContent}
        popupPlacement={popupPlacement}
        popupHidden={hidden || !this.popup}
        builtinPlacements={BUILT_IN_PLACEMENTS}
        onPopupAnimateAppear={this.handlePopupAnimateAppear}
        onPopupAnimateEnd={this.handlePopupAnimateEnd}
        onPopupHiddenChange={this.handlePopupHiddenChange}
        getPopupStyleFromAlign={this.getPopupStyleFromAlign}
        getRootDomNode={this.getRootDomNode}
        getPopupContainer={getPopupContainer}
        tabIntoPopupContent={tabIntoPopupContent}
        childrenProps={renderedValue}
      >
        {this.getEditor}
      </Trigger>
    );
  }

  getWrapperClassNames(...args): string {
    const { prefixCls } = this;
    return super.getWrapperClassNames(...args, {
      [`${prefixCls}-expand`]: this.popup,
      [`${prefixCls}-not-editable`]: !this.disabled && !this.editable,
    });
  }

  getDefaultSuffix(): ReactNode {
    const { prefixCls } = this;
    return <Icon type={this.getTriggerIconFont()} className={`${prefixCls}-trigger`} />;
  }

  @autobind
  handleTagAnimateEnd() {
    this.forcePopupAlign();
  }

  @autobind
  handlePopupMouseDown(e) {
    e.preventDefault();
    const { onMouseDown = noop } = this.props;
    onMouseDown(e);
  }

  @autobind
  handlePopupHiddenChange(hidden: boolean) {
    this.setPopup(!hidden);
    const { onPopupHiddenChange = noop } = this.props;
    onPopupHiddenChange(hidden);
  }

  forcePopupAlign() {
    if (this.trigger) {
      this.trigger.forcePopupAlign();
    }
  }

  expand() {
    this.popupTask.cancel();
    if (!this.readOnly && !this.popup) {
      this.popupTask.delay(this.props.triggerShowDelay as number, () => {
        this.setPopup(true);
      });
    }
  }

  collapse() {
    this.popupTask.cancel();
    if (!this.readOnly && this.popup) {
      this.popupTask.delay(this.props.triggerHiddenDelay as number, () => {
        this.setPopup(false);
      });
    }
  }
}
