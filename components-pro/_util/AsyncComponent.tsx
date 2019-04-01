import React, { Component, ReactType } from 'react';
import Spin from '../spin';
import exception from './exception';

interface AsyncComponentState {
  component?: ReactType;
}

const asyncComponent = (importComponent: () => Promise<{ default: ReactType }>): any => {
  class AsyncComponent extends Component<any> {
    state: AsyncComponentState = {};

    componentDidMount() {
      importComponent().then(({ default: component }) => {
        this.setState({ component });
      }, (e) => {
        exception(e);
      });
    }

    render() {
      const { component: Cmp } = this.state;

      return Cmp
        ? <Cmp {...this.props} />
        : <Spin />;
    }

  }

  return AsyncComponent;
};

export default asyncComponent;
