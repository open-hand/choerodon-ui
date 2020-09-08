import React from 'react';
import ReactDOM from 'react-dom';
import { RichText, Switch } from 'choerodon-ui/pro';

const style = { height: 200 };

const options = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean'],                                         // remove formatting button
    ],
    imageDropAndPaste: false,
  },
};

class App extends React.Component {
  state = { mode: 'editor' };

  handlePreviewChange = (value) => {
    console.log(value);
    this.setState({ mode: value ? 'preview' : 'editor' });
  };

  render() {
    const { mode } = this.state;
    return (
      <>
        <div style={{ height: 220 }}>
          <RichText mode={mode} style={style} options={options} toolbar="none" />
        </div>
        <Switch style={{ paddingTop: 10 }} onChange={this.handlePreviewChange} checked={mode === 'preview'}>preview</Switch>
      </>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
