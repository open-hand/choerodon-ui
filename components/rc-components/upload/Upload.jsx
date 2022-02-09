import React, { Component } from 'react';
import noop from 'lodash/noop';
import AjaxUpload from './AjaxUploader';
import IframeUpload from './IframeUploader';

class Upload extends Component {
  static defaultProps = {
    component: 'span',
    prefixCls: 'rc-upload',
    data: {},
    headers: {},
    name: 'file',
    multipart: false,
    onReady: noop,
    onStart: noop,
    onError: noop,
    onSuccess: noop,
    supportServerRender: false,
    multiple: false,
    beforeUpload: null,
    customRequest: null,
    withCredentials: false,
  };

  state = {
    Component: null,
  };

  componentDidMount() {
    if (this.props.supportServerRender) {
      /* eslint react/no-did-mount-set-state:0 */
      this.setState({
        Component: this.getComponent(),
      }, this.props.onReady);
    }
  }

  getComponent() {
    return typeof File !== 'undefined' ? AjaxUpload : IframeUpload;
  }

  abort(file) {
    this.uploader.abort(file);
  }

  saveUploader = (node) => {
    this.uploader = node;
  };

  render() {
    if (this.props.supportServerRender) {
      const ComponentUploader = this.state.Component;
      if (ComponentUploader) {
        return <ComponentUploader {...this.props} ref={this.saveUploader} />;
      }
      return null;
    }
    const ComponentUploader = this.getComponent();
    return <ComponentUploader {...this.props} ref={this.saveUploader} />;
  }
}

export default Upload;
