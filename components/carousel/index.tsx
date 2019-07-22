import React, { Component, CSSProperties } from 'react';
import debounce from 'lodash/debounce';
import classNames from 'classnames';
import { getPrefixCls } from '../configure';
import { matchMediaPolifill } from '../_util/mediaQueryListPolyfill';

// matchMedia polyfill for
// https://github.com/WickyNilliams/enquire.js/issues/82
if (typeof window !== 'undefined') {
  // const matchMediaPolyfill = (mediaQuery: string): MediaQueryList => {
  //   return {
  //     media: mediaQuery,
  //     matches: false,
  //     addListener() {
  //     },
  //     removeListener() {
  //     },
  //   };
  // };
  window.matchMedia = window.matchMedia || matchMediaPolifill;
}
// Use require over import (will be lifted up)
// make sure matchMedia polyfill run before require('react-slick')
const SlickCarousel = require('react-slick').default;

export type CarouselEffect = 'scrollx' | 'fade';

// Carousel
export interface CarouselProps {
  effect?: CarouselEffect;
  dots?: boolean;
  vertical?: boolean;
  autoplay?: boolean;
  easing?: string;
  beforeChange?: (from: number, to: number) => void;
  afterChange?: (current: number) => void;
  style?: CSSProperties;
  prefixCls?: string;
  accessibility?: boolean;
  nextArrow?: HTMLElement | any;
  prevArrow?: HTMLElement | any;
  pauseOnHover?: boolean;
  className?: string;
  adaptiveHeight?: boolean;
  arrows?: boolean;
  autoplaySpeed?: number;
  centerMode?: boolean;
  centerPadding?: string | any;
  cssEase?: string | any;
  dotsClass?: string;
  draggable?: boolean;
  fade?: boolean;
  focusOnSelect?: boolean;
  infinite?: boolean;
  initialSlide?: number;
  lazyLoad?: boolean;
  rtl?: boolean;
  slide?: string;
  slidesToShow?: number;
  slidesToScroll?: number;
  speed?: number;
  swipe?: boolean;
  swipeToSlide?: boolean;
  touchMove?: boolean;
  touchThreshold?: number;
  variableWidth?: boolean;
  useCSS?: boolean;
  slickGoTo?: number;
}

export default class Carousel extends Component<CarouselProps, {}> {
  static displayName = 'Carousel';
  static defaultProps = {
    dots: true,
    arrows: false,
    draggable: false,
  };

  innerSlider: any;

  private slick: any;

  private onWindowResized = debounce(() => {

    const { autoplay } = this.props;
    if (autoplay && this.slick && this.slick.innerSlider && this.slick.innerSlider.autoPlay) {
      this.slick.innerSlider.autoPlay();
    }
  }, 500, {
    leading: false,
  });

  componentDidMount() {
    const { autoplay } = this.props;
    if (autoplay) {
      window.addEventListener('resize', this.onWindowResized);
    }

    this.innerSlider = this.slick && this.slick.innerSlider;
  }

  componentWillUnmount() {
    const { autoplay } = this.props;
    if (autoplay) {
      window.removeEventListener('resize', this.onWindowResized);
      (this.onWindowResized as any).cancel();
    }
  }

  saveSlick = (node: any) => {
    this.slick = node;
  };

  next() {
    this.slick.slickNext();
  }

  prev() {
    this.slick.slickPrev();
  }

  goTo(slide: number) {
    this.slick.slickGoTo(slide);
  }

  render() {
    const props: CarouselProps & { children?: any } = {
      ...this.props,
    };

    if (props.effect === 'fade') {
      props.fade = true;
    }

    const prefixCls = getPrefixCls('carousel', props.prefixCls);

    const className = classNames(prefixCls, {
      [`${prefixCls}-vertical`]: props.vertical,
    });

    return (
      <div className={className}>
        <SlickCarousel ref={this.saveSlick} {...props} />
      </div>
    );
  }
}
