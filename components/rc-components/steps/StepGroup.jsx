/* eslint react/no-did-mount-set-state: 0 */
import React, { Children, cloneElement, Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import noop from 'lodash/noop';
import Dropdown from 'choerodon-ui/pro/lib/dropdown';
import { isFlexSupported, getStyle } from './utils';
import StepGroup from './StepGroup';
import Step from './Step';
import RenderIcon from './RenderIcon'
import Icon from '../../icon';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';
import Menu from '../../menu';
import MenuItem from '../../menu/MenuItem';
import EventManager from '../../_util/EventManager';



export default class Steps extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    iconPrefix: PropTypes.string,
    direction: PropTypes.string,
    labelPlacement: PropTypes.string,
    children: PropTypes.any,
    status: PropTypes.string,
    size: PropTypes.string,
    progressDot: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    style: PropTypes.object,
    current: PropTypes.number,
    getNumberChange: PropTypes.func,
    setNumberChange: PropTypes.func,
    headerRender: PropTypes.func,
    headerIcon: PropTypes.string,
    headerText: PropTypes.string,
  };

  static defaultProps = {
    prefixCls: 'rc-steps',
    iconPrefix: 'rc',
    direction: 'horizontal',
    labelPlacement: 'horizontal',
    current: 0,
    status: 'process',
    size: '',
    progressDot: false,
    type: 'default'
  };

  constructor(props) {
    super(props);
    this.state = {
      flexSupported: true,
      lastStepOffsetWidth: 0,
      isShowMore: false,
    };
    this.calcStepOffsetWidth = debounce(this.calcStepOffsetWidth, 150);
    this.resizeEvent = new EventManager(typeof window === 'undefined' ? undefined : window);
    this.pageNo = 1;
    this.pageSize = 0;
  }

  componentDidMount() {
    this.props.setNumberChange(0)
    this.calcStepOffsetWidth();
    if (!isFlexSupported()) {
      this.setState({
        flexSupported: false,
      });
    }
    if (this.props.type === 'navigation') {
      this.showMore()
      const debouncedResize = debounce(() => {
        this.showMore()
      }, 200);
      this.resizeEvent.addEventListener('resize', debouncedResize)
    }
  }

  componentDidUpdate() {
    this.props.setNumberChange((this.pageNo - 1) * this.pageSize)
    this.calcStepOffsetWidth();
  }

  componentWillUnmount() {
    this.props.setNumberChange(0)
    if (this.calcTimeout) {
      clearTimeout(this.calcTimeout);
    }
    if (this.calcStepOffsetWidth && this.calcStepOffsetWidth.cancel) {
      this.calcStepOffsetWidth.cancel();
    }
    this.resizeEvent.removeEventListener('resize')
  }

  showMore = () => {
    const containerWidth = this.stepsRef.offsetWidth;
    let isShowMore = false
    const childLength = this.props.children.length
    const minWidth = 176; // 最小宽度176
    const containerNumber = Math.floor(containerWidth / minWidth); // 可容纳个数
    if (containerNumber < childLength) {
      isShowMore = true;
      this.pageSize = containerNumber
    }
    this.setState({
      isShowMore,
    })
  }

  calcStepOffsetWidth = () => {
    if (isFlexSupported()) {
      return;
    }
    // Just for IE9
    const domNode = findDOMNode(this);
    if (domNode.children.length > 0) {
      if (this.calcTimeout) {
        clearTimeout(this.calcTimeout);
      }
      this.calcTimeout = setTimeout(() => {
        // +1 for fit edge bug of digit width, like 35.4px
        const lastStepOffsetWidth = (domNode.lastChild.offsetWidth || 0) + 1;
        // Reduce shake bug
        if (
          this.state.lastStepOffsetWidth === lastStepOffsetWidth ||
          Math.abs(this.state.lastStepOffsetWidth - lastStepOffsetWidth) <= 3
        ) {
          return;
        }
        this.setState({ lastStepOffsetWidth });
      });
    }
  };


  setNumberChange = (index) => {
    this.props.setNumberChange(index)
  }

  getNumberChange = () => {
    this.props.getNumberChange()
  }

  menuClick = (e) => {
    const { onChange = noop } = this.props;
    onChange(Number(e.key))
  }
  render() {
    const {
      prefixCls,
      style = {},
      className,
      children,
      direction,
      labelPlacement,
      iconPrefix,
      status,
      size,
      current,
      progressDot,
      setNumberChange,
      getNumberChange,
      headerRender,
      headerIcon,
      headerText,
      type,
      onChange,
      ...restProps
    } = this.props;
    const { lastStepOffsetWidth, flexSupported, isShowMore } = this.state;
    const filteredChildren = Children.toArray(children).filter(c => !!c);
    const lastIndex = filteredChildren.length - 1;
    const adjustedlabelPlacement = !!progressDot ? 'vertical' : labelPlacement;
    const classString = classNames(prefixCls, `${prefixCls}-${direction}`, className, {
      [`${prefixCls}-${size}`]: size,
      [`${prefixCls}-label-${adjustedlabelPlacement}`]: direction === 'horizontal',
      [`${prefixCls}-dot`]: !!progressDot,
    });

    const menu = () => {
      return <Menu onClick={this.menuClick}>
        {
          filteredChildren.map((child, index) => {
            const childProps = {
              stepNumber: `${index + 1}`,
              prefixCls,
              iconPrefix,
              ...child.props,
            };
            if (!child.props.status) {
              if (index === current) {
                childProps.status = status;
              } else if (index < current) {
                childProps.status = 'finish';
              } else {
                childProps.status = 'wait';
              }
            }
            const classString = classNames(`${prefixCls}-item`, `${prefixCls}-item-${childProps.status}`, className, {
              [`${prefixCls}-item-custom`]: child.props.icon,
            });
            const iconCls = classNames(`${prefixCls}-item-icon`, `${prefixCls}-item-dropdown-icon`)
            return (
              <MenuItem key={index}>
                <div className={classString}>
                  <div className={iconCls}>{<RenderIcon {...childProps} />}</div>
                  <div className={`${prefixCls}-item-dropdown-title`}>{childProps.title}</div>
                </div>
              </MenuItem>
            )
          })
        }
      </Menu>
    }

    const renderHeader = (renderFn, headerTitle, IconText) => {
      let headerChildren = [];

      if (isString(IconText)) {
        headerChildren.push(<Icon key="IconText" type={IconText} className={classNames(`${prefixCls}-header-icon`)} />)
      }
      if (isString(headerTitle)) {
        headerChildren.push(<span key="headerTitle" className={classNames(`${prefixCls}-header-title`)}>{headerTitle}</span>)
      }

      if (isFunction(renderFn)) {
        const componentFn = renderFn
        const renderFNHOC = (ComponentFn) => {
          return class renderFN extends Component {
            render() {
              return ComponentFn()
            }
          }
        }

        const HasKeyComponent = renderFNHOC(componentFn)
        headerChildren = [<HasKeyComponent key={"renderFn"} />]
      }

      return headerChildren.length > 0 ? <div className={`${prefixCls}-header`}>{headerChildren}</div> : null;
    }

    // 限制导航步骤条 只能 横向显示
    const isNavigation = type === 'navigation' && direction !== 'vertical';

    // 当步骤过多超过容器宽度，应分页显示
    const getChild = () => {
      if (!isNavigation) {
        return filteredChildren
      }
      if (this.pageSize > 0) {
        if (current + 1 > this.pageSize && current >= (this.pageSize * this.pageNo)) {
          setNumberChange(this.pageSize * this.pageNo)
          this.pageNo++;
        } else if (current + 1 <= (this.pageSize * (this.pageNo - 1)) && this.pageNo > 1) {
          this.pageNo--
          setNumberChange(this.pageSize * (this.pageNo - 1))
        }
        return filteredChildren.slice(this.pageSize * (this.pageNo - 1), (this.pageSize * this.pageNo))
      } else {
        return filteredChildren
      }
    }

    return (
      <div className={`${prefixCls}-${isNavigation ? `navigation` : 'defalut'}`}>
        <div className={classString} style={style} {...restProps} ref={ref => { this.stepsRef = ref }}>
          {renderHeader(
            headerRender,
            headerText,
            headerIcon
          )}
          {Children.map(getChild(), (child, index) => {
            if (child.type === Step) {
              let gIndex = getNumberChange()
              const childProps = {
                stepNumber: `${gIndex + 1}`,
                prefixCls,
                iconPrefix,
                wrapperStyle: style,
                progressDot,
                onChange,
                ...child.props,
              };
              /**
               * 如果支持flex布局 方向不是垂直 indx不是最后一个
               */
              if (!flexSupported && direction !== 'vertical' && gIndex !== lastIndex) {
                childProps.itemWidth = `${100 / lastIndex}%`;
                childProps.adjustMarginRight = -Math.round(lastStepOffsetWidth / lastIndex + 1);
              }
              // fix tail color 修复末尾颜色
              if (status === 'error' && gIndex === current - 1) {
                childProps.className = `${prefixCls}-next-error`;
              }
              if (!child.props.status) {
                if (gIndex === current) {
                  childProps.status = status;
                } else if (gIndex < current) {
                  childProps.status = 'finish';
                } else {
                  childProps.status = 'wait';
                }
              }
              setNumberChange(++gIndex)

              return (
                cloneElement(child, childProps)
              );
            }

            if (child.type === StepGroup) {
              let gruopProps = { ...this.props };
              gruopProps.children = child.props.children
              gruopProps.className = classNames(`${prefixCls}-group`, child.props.className);
              return cloneElement(child, gruopProps);
            }
            return null;
          })}
        </div>
        {
          isShowMore && direction !== 'vertical' &&
          <div className={`${prefixCls}-dropdown`} >
            <Dropdown overlay={menu} key="more">
              <div className={`${prefixCls}-dropdown-icon`}><Icon type="more_horiz" /></div>
            </Dropdown>
          </div>
        }
      </div>
    )
  }
}
