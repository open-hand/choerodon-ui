import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import LightBox from 'react-image-lightbox';
import omit from 'lodash/omit';
import { toJS } from 'mobx';
import classNames from 'classnames';
import 'react-quill/dist/quill.snow.css';
import { delta2Html } from './utils';

export interface RichTextViewerProps {
  deltaOps?: any;
  className?: string;
  style?: React.CSSProperties;
}

class RichTextViewer extends Component<RichTextViewerProps> {
  state = {
    open: false,
    images: [],
    srcIndex: 0,
  };

  componentDidMount() {
    const { deltaOps } = this.props;
    const thisNode = findDOMNode(this);
    if (thisNode && deltaOps) {
      thisNode.addEventListener('click', this.open);
    }
  }

  componentWillUnmount() {
    const thisNode = findDOMNode(this);
    if (thisNode) thisNode.removeEventListener('click', this.open);
  }

  open = (e) => {
    const { target } = e;
    if (target && target.nodeName === 'IMG') {
      e.stopPropagation();
      const { deltaOps } = this.props;
      const imgArr: string[] = [];
      deltaOps.forEach(item => {
        const image = item.insert.image;
        if (image) {
          imgArr.push(image);
        }
      });
      const { src } = target;
      const index = imgArr.findIndex(img => img === src);
      this.setState({
        open: true,
        images: imgArr,
        srcIndex: index,
      });
    }
  };

  escape = str => str.replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--');

  getOtherProps() {
    return omit(this.props, ['deltaOps']);
  }

  render() {
    const { deltaOps, className } = this.props;
    const { open, images, srcIndex } = this.state;
    const html = delta2Html(toJS(deltaOps));

    const classString = classNames(
      className,
      'quill',
    );

    return (
      <div {...this.getOtherProps()} className={classString}>
        <div className="ql-container ql-snow">
          <div dangerouslySetInnerHTML={{ __html: `${this.escape(html)}` }} className="ql-editor" />
          {
            open ? (
              <LightBox
                mainSrc={images[srcIndex]}
                onCloseRequest={() => this.setState({ open: false })}
                imageTitle="images"
                prevSrc={images[srcIndex - 1]}
                nextSrc={images[srcIndex + 1]}
                onMovePrevRequest={
                  () => {
                    this.setState({ srcIndex: srcIndex - 1 });
                  }
                }
                onMoveNextRequest={
                  () => {
                    this.setState({ srcIndex: srcIndex + 1 });
                  }
                }
              />
            ) : null
          }
        </div>
      </div>
    );
  }
}

export default RichTextViewer;
