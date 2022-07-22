import {
  cloneElement,
  PureComponent,
  createElement,
  isValidElement,
  Key,
  ReactElement,
  ReactNode,
} from 'react';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import {
  findChildInChildrenByKey,
  findShownChildInChildrenByKey,
  isSameChildren,
  mergeChildren,
  toArrayChildren,
} from './ChildrenUtils';
import AnimateChild, { AnimateChildProps } from './AnimateChild';
import animUtil from './util';

const defaultKey = `animate_${Date.now()}`;

function getChildrenFromProps(props): ReactNode {
  const { children } = props;
  if (isValidElement(children)) {
    if (!children.key) {
      return cloneElement(children, {
        key: defaultKey,
      } as any);
    }
  }
  return children;
}

export interface AnimateProps {
  className?: string;
  component?: any;
  componentProps?: object;
  animation?: object;
  transitionName?: string | object;
  transitionEnter?: boolean;
  transitionAppear?: boolean;
  exclusive?: boolean;
  transitionLeave?: boolean;
  onEnd?: (key: Key | null, flag: boolean, childRef: AnimateChild) => void;
  onEnter?: (key: Key | null, childRef: AnimateChild) => void;
  onLeave?: (key: Key | null, childRef: AnimateChild) => void;
  onAppear?: (key: Key | null, childRef: AnimateChild) => void;
  hiddenProp?: string;
}

export interface AnimateState {
  children: ReactElement<any>[];
}

export default class Animate extends PureComponent<AnimateProps> {
  static displayName = 'Animate';

  static defaultProps = {
    component: 'span',
    transitionEnter: true,
    transitionLeave: true,
    transitionAppear: false,
  };

  currentlyAnimatingKeys = {};

  keysToEnter: Key[] = [];

  keysToLeave: Key[] = [];

  state: AnimateState = {
    children: toArrayChildren(getChildrenFromProps(this.props)),
  };

  childrenRefs = {};

  nextProps?: object;

  componentDidMount() {
    const { hiddenProp } = this.props;
    let { children } = this.state;
    if (hiddenProp) {
      children = children.filter(child => !child.props[hiddenProp]);
    }
    children.forEach(child => {
      if (child && child.key) {
        this.performAppear(child.key);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.nextProps = nextProps;
    const nextChildren = toArrayChildren(getChildrenFromProps(nextProps));
    const { exclusive, hiddenProp } = this.props;
    const { children } = this.state;
    const currentlyAnimatingKeys = this.currentlyAnimatingKeys;
    if (exclusive) {
      Object.keys(currentlyAnimatingKeys).forEach(key => this.stop(key));
    }
    const currentChildren = exclusive
      ? toArrayChildren(getChildrenFromProps(this.props))
      : children;
    let newChildren: ReactElement<any>[] = [];
    if (hiddenProp) {
      nextChildren.forEach(nextChild => {
        if (nextChild) {
          let newChild;
          const currentChild = findChildInChildrenByKey(currentChildren, nextChild.key);
          if (nextChild.props[hiddenProp] && currentChild && !currentChild.props[hiddenProp]) {
            newChild = cloneElement(nextChild, { [hiddenProp]: false });
          } else {
            newChild = nextChild;
          }
          if (newChild) {
            newChildren.push(newChild);
          }
        }
      });
      newChildren = mergeChildren(currentChildren, newChildren);
    } else {
      newChildren = mergeChildren(currentChildren, nextChildren);
    }

    this.setState({
      children: newChildren,
    });

    nextChildren.forEach(child => {
      const key = child && child.key;
      if (key) {
        if (child && currentlyAnimatingKeys[key]) {
          return;
        }
        const hasPrev = child && findChildInChildrenByKey(currentChildren, key);
        if (hiddenProp) {
          const showInNext = !child.props[hiddenProp];
          if (hasPrev) {
            const showInNow = findShownChildInChildrenByKey(currentChildren, key, hiddenProp);
            if (!showInNow && showInNext) {
              this.keysToEnter.push(key);
            }
          } else if (showInNext) {
            this.keysToEnter.push(key);
          }
        } else if (!hasPrev) {
          this.keysToEnter.push(key);
        }
      }
    });

    currentChildren.forEach(child => {
      const key = child && child.key;
      if (key) {
        if (child && currentlyAnimatingKeys[key]) {
          return;
        }
        const hasNext = child && findChildInChildrenByKey(nextChildren, key);
        if (hiddenProp) {
          const showInNow = !child.props[hiddenProp];
          if (hasNext) {
            const showInNext = findShownChildInChildrenByKey(nextChildren, key, hiddenProp);
            if (!showInNext && showInNow) {
              this.keysToLeave.push(key);
            }
          } else if (showInNow) {
            this.keysToLeave.push(key);
          }
        } else if (!hasNext) {
          this.keysToLeave.push(key);
        }
      }
    });
  }

  componentDidUpdate() {
    const keysToEnter = this.keysToEnter;
    this.keysToEnter = [];
    keysToEnter.forEach(this.performEnter);
    const keysToLeave = this.keysToLeave;
    this.keysToLeave = [];
    keysToLeave.forEach(this.performLeave);
  }

  isValidChildByKey(currentChildren, key): boolean {
    const { hiddenProp } = this.props;
    if (hiddenProp) {
      return !!findShownChildInChildrenByKey(currentChildren, key, hiddenProp);
    }
    return !!findChildInChildrenByKey(currentChildren, key);
  }

  stop(key) {
    delete this.currentlyAnimatingKeys[key];
    const component = this.childrenRefs[key];
    if (component) {
      component.stop();
    }
  }

  render() {
    const { props } = this;
    this.nextProps = props;
    const {
      animation,
      transitionName,
      transitionEnter,
      transitionAppear,
      transitionLeave,
      component: Cmp,
      componentProps,
      ...otherProps
    } = props;
    const { children: stateChildren } = this.state;
    let children: ReactElement<any>[] = [];
    if (stateChildren) {
      children = stateChildren.map(child => {
        if (child === null || child === undefined) {
          return child;
        }
        if (!child.key) {
          throw new Error('must set key for animate children');
        }
        return createElement(
          AnimateChild,
          {
            key: child.key,
            ref: node => {
              if (child.key) {
                this.childrenRefs[child.key] = node;
              }
            },
            animation,
            transitionName,
            transitionEnter,
            transitionAppear,
            transitionLeave,
          } as AnimateChildProps,
          child,
        );
      });
    }
    if (Cmp) {
      const passedProps = omit(otherProps, [
        'exclusive',
        'onEnd',
        'onEnter',
        'onLeave',
        'onAppear',
        'hiddenProp',
      ]);
      return createElement(
        Cmp,
        {
          ...passedProps,
          ...componentProps,
        },
        children,
      );
    }
    return children[0] || null;
  }

  performEnter = (key: Key) => {
    const childRef = this.childrenRefs[key];
    if (childRef) {
      this.currentlyAnimatingKeys[key] = true;
      childRef.componentWillEnter(this.handleDoneAdding.bind(this, key, 'enter'));
    }
  };

  performAppear = (key: Key) => {
    const childRef = this.childrenRefs[key];
    if (childRef) {
      this.currentlyAnimatingKeys[key] = true;
      childRef.componentWillAppear(this.handleDoneAdding.bind(this, key, 'appear'));
    }
  };

  handleDoneAdding = (key: Key, type, childRef) => {
    const { props } = this;
    const { exclusive, onAppear = noop, onEnd = noop, onEnter = noop } = props;
    delete this.currentlyAnimatingKeys[key];
    if (exclusive && props !== this.nextProps) {
      return;
    }
    if (!this.isValidChildByKey(toArrayChildren(getChildrenFromProps(props)), key)) {
      this.performLeave(key);
    } else if (type === 'appear') {
      if (animUtil.allowAppearCallback(props)) {
        onAppear(key, childRef);
        onEnd(key, true, childRef);
      }
    } else if (animUtil.allowEnterCallback(props)) {
      onEnter(key, childRef);
      onEnd(key, true, childRef);
    }
  };

  performLeave = (key: Key) => {
    const childRef = this.childrenRefs[key];
    if (childRef) {
      this.currentlyAnimatingKeys[key] = true;
      childRef.componentWillLeave(this.handleDoneLeaving.bind(this, key));
    }
  };

  handleDoneLeaving = (key: Key, childRef) => {
    const {
      props,
      state: { children },
    } = this;
    const { exclusive, onEnd = noop, onLeave = noop, hiddenProp } = props;
    delete this.currentlyAnimatingKeys[key];
    if (exclusive && props !== this.nextProps) {
      return;
    }
    const currentChildren = toArrayChildren(getChildrenFromProps(props));
    if (this.isValidChildByKey(currentChildren, key)) {
      this.performEnter(key);
    } else {
      const end = () => {
        if (animUtil.allowLeaveCallback(props)) {
          onLeave(key, childRef);
          onEnd(key, false, childRef);
        }
      };
      if (!isSameChildren(children, currentChildren, hiddenProp)) {
        this.setState(
          {
            children: currentChildren,
          },
          end,
        );
      } else {
        end();
      }
    }
  };
}
