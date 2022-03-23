import React, { Component, CSSProperties, ReactElement, ReactNode } from 'react';
import Tooltip from '../tooltip';
import RcSlider, { Handle as RcHandle, Range as RcRange } from '../rc-components/slider';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface SliderMarks {
  [key: number]:
  | ReactNode
  | {
    style: CSSProperties;
    label: ReactNode;
  };
}

export type SliderValue = number | [number, number];

export type HandleGeneratorFn = (info: {
  value: number;
  dragging: boolean;
  index: number;
  rest: any[];
}) => ReactElement<any>;

export interface SliderProps {
  prefixCls?: string;
  tooltipPrefixCls?: string;
  range?: boolean;
  min?: number;
  max?: number;
  step?: number | null;
  marks?: SliderMarks;
  dots?: boolean;
  value?: SliderValue;
  defaultValue?: SliderValue;
  included?: boolean;
  disabled?: boolean;
  vertical?: boolean;
  tooltipVisible?: boolean;
  onChange?: (value: SliderValue) => void;
  onAfterChange?: (value: SliderValue) => void;
  tipFormatter?: null | ((value: number) => ReactNode);
  className?: string;
  id?: string;
}

export interface SliderState {
  visibles: { [index: number]: boolean };
}

export default class Slider extends Component<SliderProps, SliderState> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static displayName = 'Slider';

  static defaultProps = {
    tooltipVisible: true,
    tipFormatter(value: number) {
      return value.toString();
    },
  };

  context: ConfigContextValue;

  private rcSlider: any;

  constructor(props: SliderProps) {
    super(props);
    this.state = {
      visibles: {},
    };
  }

  toggleTooltipVisible = (index: number, visible: boolean) => {
    this.setState(({ visibles }) => ({
      visibles: {
        ...visibles,
        [index]: visible,
      },
    }));
  };

  handleWithTooltip: HandleGeneratorFn = ({ value, dragging, index, ...restProps }) => {
    const { tooltipPrefixCls, tooltipVisible, tipFormatter } = this.props;
    const { visibles } = this.state;
    const visible = tooltipVisible ? visibles[index] || dragging : false;
    return (
      <Tooltip
        prefixCls={tooltipPrefixCls}
        title={tipFormatter ? tipFormatter(value) : `${value}`}
        visible={visible}
        placement="top"
        transitionName="zoom-down"
        key={index}
      >
        <RcHandle
          {...restProps}
          value={value}
          onMouseEnter={() => this.toggleTooltipVisible(index, true)}
          onMouseLeave={() => this.toggleTooltipVisible(index, false)}
        />
      </Tooltip>
    );
  };

  focus() {
    this.rcSlider.focus();
  }

  blur() {
    this.rcSlider.focus();
  }

  saveSlider = (node: any) => {
    this.rcSlider = node;
  };

  render() {
    const { range, prefixCls: customizePrefixCls, ...restProps } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('slider', customizePrefixCls);
    if (range) {
      return (
        <RcRange
          {...restProps}
          ref={this.saveSlider}
          handle={this.handleWithTooltip}
          prefixCls={prefixCls}
        />
      );
    }
    return (
      <RcSlider
        {...restProps}
        ref={this.saveSlider}
        handle={this.handleWithTooltip}
        prefixCls={prefixCls}
      />
    );
  }
}
