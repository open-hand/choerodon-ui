import React, { CSSProperties, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import noop from 'lodash/noop';
import { action, observable, runInAction } from 'mobx';
import Trigger from 'choerodon-ui/lib/trigger/Trigger';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import { getIf } from '../data-set/utils';
import { TextField, TextFieldProps } from '../text-field/TextField';
import autobind from '../_util/autobind';
import Icon from '../icon';
import TaskRunner from '../_util/TaskRunner';
import BUILT_IN_PLACEMENTS from './placements';
import { TriggerViewMode } from './enum';
import { hide } from '../tooltip/singleton';

export interface TriggerFieldPopupContentProps {
  setValue: (value) => void;
  setPopup: (hidden: boolean) => void;
  content: ReactNode;
}

export {
  TriggerViewMode,
};

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
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement | undefined | null;
  /**
   * 定义浮层对齐的目标，默认为组件最外层元素
   */
  getPopupAlignTarget?: () => HTMLElement;
  /**
   * 当popup中有可获取焦点对象时，是否按tab键时获取焦点
   */
  tabIntoPopupContent?: boolean;

  viewMode?: TriggerViewMode;
}

export default abstract class TriggerField<T extends TriggerFieldProps = TriggerFieldProps> extends TextField<T> {
  static displayName = 'TriggerField';

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'trigger',
    clearButton: true,
    popupPlacement: 'bottomLeft',
    triggerShowDelay: 150,
    triggerHiddenDelay: 50,
    viewMode: TriggerViewMode.popup,
  };

  popupTask?: TaskRunner;

  trigger: Trigger | null;

  domNode: Element | Text | null;

  @observable statePopup: boolean;

  get popup(): boolean {
    return this.statePopup;
  }

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.statePopup = false;
    });
  }

  componentDidMount(): void {
    this.domNode = this.getRootDomNode();
    super.componentDidMount();
  }

  componentDidUpdate() {
    this.domNode = this.getRootDomNode();
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
    const { trigger = this.getContextConfig('selectTrigger') } = this.props;
    if (statePopup !== this.statePopup) {
      this.statePopup = statePopup;
      const { onPopupHiddenChange = noop } = this.props;
      onPopupHiddenChange(!statePopup);
      if (statePopup && !(trigger.includes(Action.hover))) {
        hide();
      }
    }
  }

  abstract getTriggerIconFont(): string;

  abstract handlePopupAnimateAppear(key): void;

  abstract handlePopupAnimateEnd(key, exists): void;

  abstract getPopupStyleFromAlign(target): CSSProperties | undefined;

  abstract getPopupContent(): ReactNode;

  @autobind
  getRootDomNode() {
    if (this.domNode) {
      return this.domNode;
    }
    return findDOMNode(this);
  }

  @autobind
  getPopupContainer(target: HTMLElement): HTMLElement | undefined {
    if (target) {
      let containerNode = target as HTMLElement;
      while (containerNode && containerNode.tagName.toLowerCase() !== 'body') {
        containerNode = containerNode.parentNode as HTMLElement;
      }
      if (containerNode) {
        return containerNode as HTMLElement;
      }
    }
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
      'getPopupAlignTarget',
      'extraFooterPlacement',
      'renderExtraFooter',
      'treeDefaultExpandedKeys',
      'treeDefaultExpandAll',
      'tabIntoPopupContent',
      'viewMode',
    ]);
  }

  getObservableProps(props, context): any {
    return {
      ...super.getObservableProps(props, context),
      viewMode: props.viewMode,
    };
  }

  getPopupProps(): TriggerFieldPopupContentProps {
    return {
      setValue: this.setValue.bind(this),
      setPopup: this.setPopup.bind(this),
      content: this.getPopupContent(),
    };
  }

  getPopupClassName(defaultClassName: string | undefined): string | undefined {
    return defaultClassName;
  }

  @autobind
  getPopupWrapper(): HTMLDivElement | undefined {
    const { trigger } = this;
    if (trigger) {
      return trigger.getPopupWrapper();
    }
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

  getDefaultAction(): Action[] {
    return [Action.focus, Action.click];
  }

  getWrappedEditor(renderedValue?: ReactNode) {
    const {
      prefixCls,
      props: {
        popupCls,
        popupStyle,
        popupPlacement,
        hidden,
        trigger = this.getDefaultAction(),
        triggerShowDelay,
        triggerHiddenDelay,
        getPopupContainer = this.getPopupContainer,
        tabIntoPopupContent,
        getPopupAlignTarget = this.getRootDomNode,
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
        getRootDomNode={getPopupAlignTarget}
        getPopupContainer={getPopupContainer}
        tabIntoPopupContent={tabIntoPopupContent}
        childrenProps={renderedValue}
        getContextConfig={this.getContextConfig}
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
  }

  forcePositionChanged() {
    this.forcePopupAlign();
  }

  forcePopupAlign() {
    if (this.trigger) {
      this.trigger.forcePopupAlign();
    }
  }

  expand() {
    const popupTask = getIf<TriggerField, TaskRunner>(this, 'popupTask', () => new TaskRunner());
    popupTask.cancel();
    if (!this.readOnly && !this.popup) {
      popupTask.delay(this.props.triggerShowDelay as number, () => {
        this.setPopup(true);
      });
    }
  }

  collapse() {
    const popupTask = getIf<TriggerField, TaskRunner>(this, 'popupTask', () => new TaskRunner());
    popupTask.cancel();
    if (!this.readOnly && this.popup) {
      const { element } = this;
      // 如果当前焦点在popup中，将焦点换给输入框
      let triggerHiddenDelay: number = this.props.triggerHiddenDelay!;
      if (this.isFocused && element !== document.activeElement) {
        element.focus();
        const { triggerShowDelay } = this.props;
        triggerHiddenDelay += triggerShowDelay as number;
      }
      popupTask.delay(triggerHiddenDelay as number, () => {
        this.setPopup(false);
      });
    }
  }
}
