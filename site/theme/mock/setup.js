import Mock from 'mockjs';

export default function() {
  if (typeof window !== 'undefined') {
    Mock.setup({
      timeout: 50,
    });
  }
}
