import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { RichTextToolbarHook, RichTextToolbarHookProps } from '../RichText';
import { RichTextToolbarType } from '../enum';
import DataSet from '../../data-set/DataSet';

export interface RichTextToolbarProps {
  prefixCls?: string;
  id?: string;
  toolbar?: RichTextToolbarType | RichTextToolbarHook;
  dataSet?: DataSet;
}

const Toolbar = (props) => {
  const { id, prefixCls } = props;
  return (
    <div id={id || 'toolbar'} className={`${prefixCls}-toolbar`}>
      <button type="button" className="ql-bold" />
      <button type="button" className="ql-italic" />
      <button type="button" className="ql-underline" />
      <button type="button" className="ql-strike" />
      <button type="button" className="ql-blockquote" />
      <button type="button" className="ql-list" value="ordered" />
      <button type="button" className="ql-list" value="bullet" />
      <button type="button" className="ql-image" />
      <button type="button" className="ql-link" />
      <select className="ql-color" />
    </div>
  );
};

@observer
export default class RichTextToolbar extends Component<RichTextToolbarProps> {
  static displayName = 'RichTextToolbar';

  renderToolBar(props: RichTextToolbarHookProps) {
    const { prefixCls } = this.props;
    return <Toolbar key="toolbar" prefixCls={prefixCls} {...props} />;
  }

  render() {
    const { id, toolbar, dataSet } = this.props;
    const props: RichTextToolbarHookProps = {
      id,
      dataSet,
    };
    if (typeof toolbar === 'function') {
      return (toolbar as RichTextToolbarHook)(props);
    }
    switch (toolbar) {
      case RichTextToolbarType.normal:
        return this.renderToolBar(props);
      default:
        return null;
    }
  }
}
