import React from 'react';
import ReactDOM from 'react-dom';
import { RichText, DataSet, Modal } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';

const defaultValue = [{ insert: 'defaultValue' }];

const style = { height: 200 };

const modalKey = Modal.key();

const { RichTextViewer } = RichText;

@observer
class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [{ name: 'content', type: 'object', defaultValue, required: true }],
  });

  handleFullScreenClick = () => {
    console.log('handleFullScreenClick');
    Modal.open({
      key: modalKey,
      title: 'Full screen',
      children: (
        <RichText
          toolbar={this.renderCustomToolbar}
          dataSet={this.ds}
          name="content"
          style={{ height: 600 }}
        />
      ),
      fullScreen: true,
    });
  };

  renderCustomToolbar = ({ id, dataSet }) => {
    console.log('id', id, 'dataSet', dataSet);
    return (
      <div id={id}>
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
        <button
          type="button"
          className="ql-fullScreen"
          style={{ outline: 'none' }}
          onClick={this.handleFullScreenClick}
        >
          <Icon type="zoom_out_map" style={{ marginTop: -5 }} />
        </button>
      </div>
    );
  };

  render() {
    return (
      <>
        <div style={{ height: 200 }}>
          <RichText
            toolbar={this.renderCustomToolbar}
            dataSet={this.ds}
            name="content"
            style={style}
          />
        </div>
        <div style={{ height: 50, lineHeight: '50px' }}>RichTextViewer:</div>
        <RichTextViewer
          style={{
            width: '100%',
            overflow: 'scroll',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            height: 200,
            padding: '0.12rem 0.15rem',
          }}
          deltaOps={this.ds.current.get('content')}
        />
      </>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
