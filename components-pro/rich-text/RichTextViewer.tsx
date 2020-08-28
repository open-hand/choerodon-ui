/* eslint-disable react/no-danger */
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import LightBox from 'react-image-lightbox';
import omit from 'lodash/omit';
import { toJS } from 'mobx';
import { delta2Html } from './utils';

export interface RichTextViewerProps {
  deltaOps?: any;
  className?: string;
  style?: React.CSSProperties;
}

class RichTextViewer extends Component<RichTextViewerProps> {
  state = {
    open: false,
    src: '',
  };

  componentDidMount() {
    const { deltaOps } = this.props;
    const thisNode = findDOMNode(this);
    if (thisNode) {
      thisNode.addEventListener('click', (e) => {
        // @ts-ignore
        if (e.target?.nodeName === 'IMG' && deltaOps && deltaOps.search(e.target.src) > -1) {
          e.stopPropagation();
          // @ts-ignore
          this.open(e.target.src);
        }
      });
    }
  }

  componentWillUnmount() {
    const thisNode = findDOMNode(this);
    if (thisNode) thisNode.removeEventListener('click', this.open);
  }

  open = (src) => {
    this.setState({
      open: true,
      src,
    });
  };

  escape = str => str.replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--');

  getOtherProps() {
    return omit(this.props, ['deltaOps']);
  }

  render() {
    const { deltaOps } = this.props;
    const { open, src } = this.state;
    const html = delta2Html(toJS(deltaOps));

    return (
      <div {...this.getOtherProps()}>
        <div dangerouslySetInnerHTML={{ __html: `${this.escape(html)}` }} />
        {
          open ? (
            <LightBox
              mainSrc={src}
              onCloseRequest={() => this.setState({ open: false })}
              imageTitle="images"
            />
          ) : null
        }
      </div>
    );
  }
}

export default RichTextViewer;
