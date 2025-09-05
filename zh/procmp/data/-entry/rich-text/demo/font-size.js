import React from 'react';
import ReactDOM from 'react-dom';
import { RichText } from 'choerodon-ui/pro';

const Size = RichText.Quill.import('attributors/style/size');
Size.whitelist = ['30px', '0.4rem'];
RichText.Quill.register(Size, true);

const defaultValue = `
  <p><span style="font-size:30px;">内容标签中设置的字体大小：30px</span></p>
  <p><span style="font-size:0.4rem;">内容标签中设置的字体大小：0.4rem</span></p>
  <p><span style="font-size:0.5rem;">内容标签中设置的字体大小（未注册不生效）：0.5rem</span></p>
`;

const App = () => {
  return (
    <>
      <RichText defaultValue={defaultValue} />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
