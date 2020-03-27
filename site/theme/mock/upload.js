import Mock from 'mockjs';

const mockTemple = {
  message: '上传成功',
  success: true,
};
const uploadRule = /\/upload/;
const uploadData = Mock.mock(mockTemple);
export default function() {
  if (typeof window !== 'undefined') {
    Mock.mock(uploadRule, mockTemple);
  }
}

export const uploadTempList = [{ rule: uploadRule, data: uploadData }];
