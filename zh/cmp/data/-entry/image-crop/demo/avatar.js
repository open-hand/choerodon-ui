import ReactDOM from 'react-dom';
import { ImageCrop, Avatar } from 'choerodon-ui';
import React, { useState, useCallback } from 'react';

const { AvatarUploader } = ImageCrop;

const Demo = () => {
  const [visable, setVisiable] = useState(false);

  const hanleClick = useCallback(() => {
    setVisiable(true);
  }, []);

  const hanleOk = useCallback(() => {
    setVisiable(false);
  }, []);

  const hanleCancel = useCallback(() => {
    setVisiable(false);
    console.log('close');
  }, []);

  return (
    <>
      <Avatar onClick={hanleClick} style={{ backgroundColor: '#87d068' }}>
        我绿了
      </Avatar>
      <AvatarUploader
        onUploadOk={hanleOk}
        onClose={hanleCancel}
        uploadUrl="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        visible={visable}
      />
    </>
  );
};

ReactDOM.render(<Demo />, document.getElementById('container'));
