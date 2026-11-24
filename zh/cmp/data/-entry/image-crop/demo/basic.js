import ReactDOM from 'react-dom';
import { ImageCrop, Button } from 'choerodon-ui';
import React, { useState, useCallback } from 'react';

const Demo = () => {
  const [visable, setVisiable] = useState(false);

  const hanleClick = useCallback(() => {
    setVisiable(true);
  }, []);

  const hanleOk = useCallback(({ url, blob, area }) => {
    console.log(url, blob, area);
    setVisiable(false);
  }, []);

  const hanleCancel = useCallback(() => {
    setVisiable(false);
    console.log('close');
  }, []);

  return (
    <>
      <Button onClick={hanleClick} funcType="raised">
        查看
      </Button>
      <ImageCrop
        modalVisible={visable}
        onOk={hanleOk}
        onCancel={hanleCancel}
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        rotate
        zoom
        grid
        aspect="12 / 13"
        showAspectInput
      />
    </>
  );
};

ReactDOM.render(<Demo />, document.getElementById('container'));
