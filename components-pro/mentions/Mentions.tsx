import React, { ReactNode, FocusEvent, KeyboardEvent } from 'react';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import isNil from 'lodash/isNil';
import Spin from 'choerodon-ui/lib/spin';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { FieldTrim } from '../data-set/enum';
import { TextAreaProps } from '../text-area/interface';
import TextArea from '../text-area';
import autobind from '../_util/autobind';
import KeywordTrigger from './KeywordTrigger';
import { MentionsContextProvider } from './MentionsContext';
import Option, { OptionProps } from './Option';
import {
  filterOption as defaultFilterOption,
  getBeforeSelectionText,
  getLastMeasureIndex,
  replaceWithMeasure,
  setInputSelection,
  validateSearch as defaultValidateSearch,
  toArray,
} from './utils';

export interface MentionsConfig {
  mentionsKey?: string | string[];
  split?: string;
}

export interface MentionsEntity {
  mentionsKey: string;
  value: string;
}

export type Placement = 'top' | 'bottom';

export interface MentionsProps extends TextAreaProps {
  notFoundContent?: ReactNode;
  split?: string;
  transitionName?: string;
  placement?: Placement;
  mentionsKey?: string | string[];
  filterOption?: false | typeof defaultFilterOption;
  validateSearch?: typeof defaultValidateSearch;
  onSelect?: (option: OptionProps, mentionsKey: string) => void;
  onSearch?: (text: string, mentionsKey: string) => void;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  loading?: boolean;
}

@observer
class Mentions<T extends MentionsProps = MentionsProps> extends TextArea<T> {
  static displayName = 'Mentions';

  static Option = Option;

  static getMentions: (value: string, config?: MentionsConfig) => MentionsEntity[];

  static defaultProps = {
    ...TextArea.defaultProps,
    suffixCls: 'mentions',
    rows: 1,
    trim: FieldTrim.left,
    mentionsKey: '@',
    split: ' ',
    validateSearch: defaultValidateSearch,
    filterOption: defaultFilterOption,
  };

  measure?: HTMLDivElement;

  focusId: number | undefined = undefined;

  @observable measuring: boolean;

  @observable measureText: string | null;

  @observable measurePrefix: string;

  @observable measureLocation: number;

  @observable activeIndex: number;

  selectionLocation = -1;

  constructor(props: MentionsProps, context) {
    super(props, context);
  
    this.initObservableObj();
  }

  @action
  initObservableObj() {
    this.measuring = false;
    this.measureLocation = 0;
    this.measureText = null;
    this.measurePrefix = '';
    this.activeIndex = 0;
  }

  componentDidUpdate() {
    super.componentDidUpdate();

    // Sync measure div top with textarea for trigger usage
    if (this.measuring && this.measure && this.element) {
      this.measure.scrollTop = this.element.scrollTop;
    }
  
    // 选择选项后设置输入框光标位置
    if (this.selectionLocation !== -1 && this.element) {
      setInputSelection(this.element, this.selectionLocation);
      this.selectionLocation = -1;
    }
  }

  getNotFoundContent() {
    if ('notFoundContent' in this.props) {
      return this.props.notFoundContent;
    }
    return this.getContextConfig('renderEmpty')('Select');
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    otherProps.onKeyUp = this.handleKeyUp;
    return otherProps;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'notFoundContent',
      'split',
      'transitionName',
      'placement',
      'prefix',
      'validateSearch',
      'filterOption',
      'onSelect',
      'onSearch',
      'getPopupContainer',
      'loading',
      'mentionsKey',
    ]);
  }

  select() {
    // noop
  }

  // Check if hit the measure keyword
  @autobind
  handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const { which } = event;
    const { activeIndex, measuring } = this;

    // Skip if not measuring
    if (!measuring) {
      super.handleKeyDown(event);
      return;
    }

    if (which === KeyCode.UP || which === KeyCode.DOWN) {
      // Control arrow function
      const optionLen = this.getOptions().length;
      const offset = which === KeyCode.UP ? -1 : 1;
      const newActiveIndex = (activeIndex + offset + optionLen) % optionLen;
      runInAction(() => {
        this.activeIndex = newActiveIndex;
      });
      event.preventDefault();
    } else if (which === KeyCode.ESC) {
      this.stopMeasure();
    } else if (which === KeyCode.ENTER) {
      // Measure hit
      event.preventDefault();
      const options = this.getOptions();
      if (!options.length) {
        this.stopMeasure();
        super.handleKeyDown(event);
        return;
      }
      const option = options[activeIndex];
      this.selectOption(option);
    }
    super.handleKeyDown(event);
  }

  /**
   * When to start measure:
   * 1. When user press `mentionsKey`
   * 2. When measureText !== prevMeasureText
   *  - If measure hit
   *  - If measuring
   *
   * When to stop measure:
   * 1. Selection is out of range
   * 2. Contains `space`
   * 3. ESC or select one
   */
  @autobind
  handleKeyUp(event: KeyboardEvent<HTMLTextAreaElement>) {
    const { key, which } = event;
    const { measureText: prevMeasureText, measuring } = this;
    const { mentionsKey = '', onKeyUp: clientOnKeyUp, onSearch, validateSearch } = this.props;
    const target = event.target as HTMLTextAreaElement;
    const selectionStartText = getBeforeSelectionText(target);
    const { location: measureIndex, mentionsKey: measurePrefix } = getLastMeasureIndex(
      selectionStartText,
      mentionsKey,
    );

    // If the client implements an onKeyUp handler, call it
    if (clientOnKeyUp) {
      clientOnKeyUp(event);
    }

    // Skip if match the white key list
    if ([KeyCode.ESC, KeyCode.UP, KeyCode.DOWN, KeyCode.ENTER].indexOf(which) !== -1) {
      return;
    }

    if (measureIndex !== -1) {
      const measureText = selectionStartText.slice(measureIndex + measurePrefix.length);
      const validateMeasure: boolean = validateSearch ? validateSearch(measureText, this.props) : false;
      const matchOption = !!this.getOptions(measureText).length;

      if (validateMeasure) {
        if (
          key === measurePrefix ||
          key === 'Shift' ||
          measuring ||
          (measureText !== prevMeasureText && matchOption)
        ) {
          this.startMeasure(measureText, measurePrefix, measureIndex);
        }
      } else if (measuring) {
        // Stop if measureText is invalidate
        this.stopMeasure();
      }

      /**
       * We will trigger `onSearch` to developer since they may use for async update.
       * If met `space` means user finished searching.
       */
      if (onSearch && validateMeasure) {
        onSearch(measureText, measurePrefix);
      }
    } else if (measuring) {
      this.stopMeasure();
    }
  }

  @autobind
  onDropdownFocus() {
    this.handleFocus();
  }

  @autobind
  onDropdownBlur() {
    this.handleBlur();
  }

  @autobind
  handleFocus(event?: FocusEvent<HTMLTextAreaElement>) {
    window.clearTimeout(this.focusId);
    if (event) {
      super.handleFocus(event);
    }
  }

  @autobind
  handleBlur(event?: FocusEvent<HTMLTextAreaElement>) {
    this.focusId = window.setTimeout(() => {
      this.stopMeasure();
    }, 0);
    if (event) {
      super.handleBlur(event);
    }
  }

  @autobind
  selectOption(option: OptionProps) {
    const { measureLocation, measurePrefix } = this;
    let value = isNil(this.text) ? this.getValue() : this.text;
    value = isNil(value) ? '' : value;
    const { split, onSelect } = this.props;

    const { value: mentionValue = '' } = option;
    const { text, selectionLocation } = replaceWithMeasure(value, {
      measureLocation,
      targetText: mentionValue,
      mentionsKey: measurePrefix,
      selectionStart: this.element ? this.element.selectionStart : -1,
      split: String(split || ''),
    });

    this.selectionLocation = selectionLocation;
    this.prepareSetValue(text);
    this.stopMeasure();

    if (onSelect) {
      onSelect(option, measurePrefix);
    }
  }

  @autobind
  @action
  setActiveIndex(activeIndex: number) {
    this.activeIndex = activeIndex;
  }

  @autobind
  setMeasureRef(element: HTMLDivElement) {
    this.measure = element;
  }

  getOptions(measureText?: string): OptionProps[] {
    const targetMeasureText = measureText || this.measureText || '';
    const { children, filterOption, loading } = this.props;
    if (loading) {
      return [{
        key: 'loading',
        children: <Spin />,
        disabled: true,
        style: { minWidth: '0.8rem', display: 'flex', justifyContent: 'center' },
      }]
    }

    const list = toArray(children)
      .map(({ props, key }) => ({
        ...props,
        key: (key || props.value) as string,
      }))
      .filter((option: OptionProps) => {
        /** Return all result if `filterOption` is false. */
        if (filterOption === false) {
          return true;
        }
        return filterOption ? filterOption(targetMeasureText, option) : true;
      });
    return list;
  }

  @action
  startMeasure(measureText: string, measurePrefix: string, measureLocation: number) {
    this.measuring = true;
    this.measureText = measureText;
    this.measurePrefix = measurePrefix;
    this.measureLocation = measureLocation;
    this.activeIndex = 0;
  }

  @action
  stopMeasure() {
    this.measuring = false;
    this.measureLocation = 0;
    this.measureText = null;
  }

  wrapperInputNode(): ReactNode {
    const { measureLocation, measurePrefix, measuring, activeIndex, prefixCls } = this;
    const value = isNil(this.text) ? this.getValue() : this.text;

    const {
      placement,
      transitionName,
      getPopupContainer,
    } = this.props;

    const options = measuring ? this.getOptions() : [];
    const renderedValue = this.renderRenderedValue(undefined, {});
    return (
      <>
        {super.wrapperInputNode(renderedValue)}
        {measuring && (
          <div ref={this.setMeasureRef} className={`${prefixCls}-measure`}>
            {value.slice(0, measureLocation)}
            <MentionsContextProvider
              value={{
                notFoundContent: this.getNotFoundContent(),
                activeIndex,
                setActiveIndex: this.setActiveIndex,
                selectOption: this.selectOption,
                onFocus: this.onDropdownFocus,
                onBlur: this.onDropdownBlur,
              }}
            >
              <KeywordTrigger
                prefixCls={prefixCls}
                transitionName={transitionName}
                placement={placement}
                options={options}
                visible
                getPopupContainer={getPopupContainer}
              >
                <span>{measurePrefix}</span>
              </KeywordTrigger>
            </MentionsContextProvider>
            {value.slice(measureLocation + measurePrefix.length)}
          </div>
        )}
      </>
    )
  }
}

Mentions.getMentions = (value = '', config: MentionsConfig = {}): MentionsEntity[] => {
  const { mentionsKey = '@', split = ' ' } = config;
  const prefixList: string[] = Array.isArray(mentionsKey) ? mentionsKey : [mentionsKey];

  return value
    .split(split)
    .map((str = ''): MentionsEntity | null => {
      let hitPrefix: string | null = null;

      prefixList.some(prefixStr => {
        const startStr = str.slice(0, prefixStr.length);
        if (startStr === prefixStr) {
          hitPrefix = prefixStr;
          return true;
        }
        return false;
      });

      if (hitPrefix !== null) {
        return {
          mentionsKey: hitPrefix,
          value: str.slice((hitPrefix as string).length),
        };
      }
      return null;
    })
    .filter((entity): entity is MentionsEntity => !!entity && !!entity.value);
};

export default Mentions;
