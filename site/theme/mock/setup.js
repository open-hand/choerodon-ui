import Mock from 'mockjs';

if (typeof window !== 'undefined') {
  Mock.setup({
    timeout: 50,
  });
}
