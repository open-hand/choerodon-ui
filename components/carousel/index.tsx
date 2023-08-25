import React, { Component, CSSProperties } from 'react';
import debounce from 'lodash/debounce';
import classNames from 'classnames';
import { matchMediaPolifill } from '../_util/mediaQueryListPolyfill';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SlickCarousel = require('react-slick').default;

export type CarouselEffect = 'scrollx' | 'fade';


export enum CarouselTheme {
  DARK = "dark",
  LIGHT = "light",
}

// Carousel
export interface CarouselProps {
  effect?: CarouselEffect;
  dots?: boolean;
  theme?: CarouselTheme;
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
  dotsActionType?: ["click", "hover"];
  verticalSwiping?: boolean;
  pauseOnDotsHover?: boolean;
  pauseOnArrowsHover?: boolean;
}

export default class Carousel extends Component<CarouselProps> {
  static displayName = 'Carousel';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    dots: true,
    arrows: false,
    draggable: false,
    theme: CarouselTheme.LIGHT,
    pauseOnDotsHover: true,
    pauseOnArrowsHover: true,
    dotsActionType: ["click"],
  };

  context: ConfigContextValue;

  innerSlider: any;

  wrapper: HTMLElement | null;

  arrowsRef: NodeListOf<Element>;

  dotsRef: NodeListOf<Element>;

  private slick: any;

  private onWindowResized = debounce(
    () => {
      const { autoplay } = this.props;
      if (autoplay && this.slick && this.slick.innerSlider && this.slick.innerSlider.autoPlay) {
        this.slick.innerSlider.autoPlay();
      }
    },
    500,
    {
      leading: false,
    },
  );

  componentDidMount() {
    const { autoplay } = this.props;
    if (autoplay) {
      window.addEventListener('resize', this.onWindowResized);
    }

    if (this.wrapper) {
      this.arrowsRef = this.wrapper.querySelectorAll('.slick-slider .slick-arrow');
      this.dotsRef = this.wrapper.querySelectorAll('.slick-slider .slick-dots li');
    }

    this.bindDotsEvent();
    this.bindArrowEvent();
    this.innerSlider = this.slick && this.slick.innerSlider;
  }

  componentWillUnmount() {
    const { autoplay } = this.props;
    if (autoplay) {
      window.removeEventListener('resize', this.onWindowResized);
      (this.onWindowResized as any).cancel();
    }
    if (this.dotsRef) {
      this.dotsRef.forEach((dot, i) => {
        dot.removeEventListener('mouseenter', () => this.handleDotsHover(i));
      });
    }
    if (this.arrowsRef) {
      this.arrowsRef.forEach((arrow) => {
        arrow.removeEventListener('mouseenter', this.handleArrowMouseChange);
        arrow.removeEventListener('mouseleave', this.handleArrowMouseChange);
      });
    }
  }

  bindDotsEvent() {
    if (this.wrapper) {
      this.dotsRef.forEach((dot, i) => {
        dot.addEventListener('mouseenter', () => this.handleDotsHover(i));
      });
    }
  }

  bindArrowEvent() {
    const { autoplay } = this.props;
    if (this.arrowsRef && autoplay) {
      this.arrowsRef.forEach((arrow) => {
        arrow.addEventListener('mouseenter', this.handleArrowMouseChange);
        arrow.addEventListener('mouseleave', this.handleArrowMouseChange);
      });
    }
  }

  handleDotsHover(index) {
    const { dotsActionType } = this.props;
    if (dotsActionType && dotsActionType.includes('hover')) {
      this.goTo(index, true);
    }
  }

  handleArrowMouseChange = (event) => {
    const { pauseOnArrowsHover } = this.props;
    if (pauseOnArrowsHover) {
      if (event.type === 'mouseleave') {
        this.play();
      } else if (event.type === 'mouseenter') {
        this.pause();
      }
    }
  }

  saveSlick = (node: any) => {
    this.slick = node;
  };

  play() {
    this.slick.slickPlay();
  }

  pause() {
    this.slick.slickPause();
  }

  next() {
    this.slick.slickNext();
  }

  prev() {
    this.slick.slickPrev();
  }

  goTo(slide: number, dontAnimate?: boolean) {
    this.slick.slickGoTo(slide, dontAnimate);
  }

  render() {
    const { getPrefixCls } = this.context;
    const { dotsClass } = this.props;
    const props: CarouselProps & { children?: any } = {
      ...this.props,
    };
    if (dotsClass) {
      props.dotsClass = ["slick-dots", dotsClass].join(' ');
    }

    if (props.effect === 'fade') {
      props.fade = true;
    }

    const prefixCls = getPrefixCls('carousel', props.prefixCls);

    const className = classNames(prefixCls, {
      [`${prefixCls}-vertical`]: props.vertical,
      [`${prefixCls}-theme-dark`]: props.theme === CarouselTheme.DARK,
    });

    return (
      <div className={className} ref={(wrapper) => { this.wrapper = wrapper }}>
        <SlickCarousel ref={this.saveSlick} {...props} />
      </div>
    );
  }
}
