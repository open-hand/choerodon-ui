import Mock from 'mockjs';

const mockTemple = {
  rows: [
    {
      expand: false,
      functionCode: 'HR',
      icon: 'fa fa-cubes',
      id: 2,
      ischecked: null,
      score: 10,
      shortcutId: null,
      text: '组织架构',
      url: null,
      symbol: '0',
      parentId: 125,
    },
  ],
  success: true,
  total: 10,
};
const treeRule = /\/tree.mock/;
const treeData = Mock.mock(mockTemple);
export default function() {
  if (typeof window !== 'undefined') {
    Mock.mock(treeRule, mockTemple);
  }
}

export const treeTempList = [{ rule: treeRule, data: treeData }];
