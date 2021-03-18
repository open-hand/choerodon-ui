import React, { PureComponent } from 'react';

class ReactIntersectionObserver extends PureComponent {

  intersectionObserver = null;

  element = null;

  state = {
    visible: typeof IntersectionObserver === 'undefined',
  };

  saveRef = (element) => {
    this.element = element;
  };

  componentDidMount() {
    this.onComponentUpdated();
  }

  componentDidUpdate() {
    this.onComponentUpdated();
  }

  componentWillUnmount() {
    this.destroyObserver();
  }

  onComponentUpdated() {
    const { visible } = this.state;
    const { disabled } = this.props;
    const { element } = this;
    if (disabled || visible) {
      // Remove intersection observer
      this.destroyObserver();
    } else if (!this.intersectionObserver && element) {
      // Add intersection observer
      this.intersectionObserver = new IntersectionObserver(this.onIntersection);
      this.intersectionObserver.observe(element);
    }
  }

  onIntersection = (entries) => {
    if (entries[0].intersectionRatio <= 0) return;
    this.setState({ visible: true });
  };

  destroyObserver() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  render() {
    const { children, placeholderHeight } = this.props;
    const { visible } = this.state;
    if (children && visible) {
      return children;
    }

    return <div ref={this.saveRef} style={{ minHeight: placeholderHeight }} />;
  }
}

export default ReactIntersectionObserver;
