import DataSet from "..";
import { data as mockData, commonDs, mockTableTreeDs } from "./mock";

describe('Record Props', () => {
  describe('disabled', () => {
    it('disabled为true-验证被校验对象是禁用和非禁用的正确性', () => {
      const ds = new DataSet({
        ...commonDs, data: mockData, record: {
          disabled: true
        }
      });
      expect(ds.current.disabled).toBeTruthy();
      expect(ds.get(1).disabled).toBeTruthy();
    })
    it('disabled为false-验证被校验对象是禁用的正确性', () => {
      const ds = new DataSet({
        ...commonDs, data: mockData, record: {
          disabled: false
        }
      });
      expect(ds.get(0).disabled).toBeFalsy();
      expect(ds.get(5).disabled).toBeFalsy();
    })
  })
  describe('selectable', () => {
    it('selectable为true-验证被校验对象是可选的正确性', () => {
      const ds = new DataSet({
        ...commonDs, data: mockData, record: {
          selectable: true
        }
      });
      expect(ds.current.selectable).toBeTruthy();
      expect(ds.get(1).selectable).toBeTruthy();
    })
    it('selectable为false-验证被校验对象是非可选的正确性', () => {
      const ds = new DataSet({
        ...commonDs, data: mockData, record: {
          selectable: false
        }
      });
      expect(ds.get(0).selectable).toBeFalsy();
      expect(ds.get(5).selectable).toBeFalsy();
    })
  })
  describe('defaultSelected', () => {
    it('defaultSelected为true-验证被校验对象是可选的正确性', () => {
      const ds = new DataSet({
        ...commonDs, data: mockData, record: {
          defaultSelected: true
        }
      });
      expect(ds.current.isSelected).toBeTruthy();
      expect(ds.get(1).isSelected).toBeTruthy();
    })
    it('defaultSelected为false-验证被校验对象非默认选中的正确性', () => {
      const ds = new DataSet({
        ...commonDs, data: mockData, record: {
          defaultSelected: false
        }
      });
      expect(ds.get(0).isSelected).toBeFalsy();
      expect(ds.get(5).isSelected).toBeFalsy();
    })
  })
  describe('defaultExpanded', () => {
    it('defaultExpanded为true-验证被校验对象是默认展开的正确性', () => {
      const ds = new DataSet({
        ...mockTableTreeDs(2, 3),
        autoLocateFirst: true,
        record: {
          defaultExpanded: true
        }
      });
      // expect(ds.current.isExpanded).toBeTruthy();
      // expect(ds.getFromTree(0).isExpanded).toBeTruthy();
      expect(ds.getFromTree(1).isExpanded).toBeFalsy();
    })
    it('defaultExpanded为false-验证被校验对象是不展开的', () => {
      const ds = new DataSet({
        ...mockTableTreeDs(2, 3),
        autoLocateFirst: true,
        record: {
          defaultExpanded: false
        }
      });
      expect(ds.getFromTree(0).isExpanded).toBeFalsy();
      expect(ds.getFromTree(1).isExpanded).toBeFalsy();
    })
  })

  describe('dynamicProps', () => {
    describe('disabled', () => {
      it('disabled为true-验证被校验对象是禁用和非禁用的正确性', () => {
        const ds = new DataSet({
          ...commonDs, data: mockData, record: {
            dynamicProps: {
              disabled: (record) => record.isCurrent
            }
          }
        });
        expect(ds.current.disabled).toBeTruthy();
        expect(ds.get(1).disabled).toBeFalsy();
      })
      it('disabled为false-验证被校验对象是禁用的正确性', () => {
        const ds = new DataSet({
          ...commonDs, data: mockData, record: {
            dynamicProps: {
              disabled: () => { return false; }
            }
          }
        });
        expect(ds.get(0).disabled).toBeFalsy();
        expect(ds.get(5).disabled).toBeFalsy();
      })
    })
    describe('selectable', () => {
      it('selectable为true-验证被校验对象是可选的正确性', () => {
        const ds = new DataSet({
          ...commonDs, data: mockData, record: {
            dynamicProps: {
              selectable: (record) => record.isCurrent
            }
          }
        });
        expect(ds.current.selectable).toBeTruthy();
        expect(ds.get(1).selectable).toBeTruthy();
      })
      it('selectable为false-验证被校验对象是非可选的正确性', () => {
        const ds = new DataSet({
          ...commonDs, data: mockData, record: {
            dynamicProps: {
              selectable: () => { return false; }
            }
          }
        });
        expect(ds.get(0).selectable).toBeFalsy();
        expect(ds.get(5).selectable).toBeFalsy();
      })
    })
    describe('defaultSelected', () => {
      it('defaultSelected为true-验证被校验对象是可选的正确性', () => {
        const ds = new DataSet({
          ...commonDs, data: mockData, record: {
            dynamicProps: {
              defaultSelected: (record) => record.isCurrent
            }
          }
        });
        expect(ds.current.isSelected).toBeTruthy();
        expect(ds.get(1).isSelected).toBeFalsy();
      })
      it('defaultSelected为false-验证被校验对象非默认选中的正确性', () => {
        const ds = new DataSet({
          ...commonDs, data: mockData, record: {
            dynamicProps: {
              defaultSelected: () => { return false; }
            }
          }
        });
        expect(ds.get(0).isSelected).toBeFalsy();
        expect(ds.get(5).isSelected).toBeFalsy();
      })
    })
    describe('defaultExpanded', () => {
      it('defaultExpanded为true-验证被校验对象是默认展开的正确性', () => {
        const ds = new DataSet({
          ...mockTableTreeDs(2, 3),
          autoLocateFirst: true,
          record: {
            dynamicProps: {
              defaultExpanded: record => record.isCurrent
            }
          }
        });
        // expect(ds.current.isExpanded).toBeTruthy();
        // expect(ds.getFromTree(0).isExpanded).toBeTruthy();
        expect(ds.getFromTree(1).isExpanded).toBeFalsy();
      })
      it('defaultExpanded为false-验证被校验对象是不展开的', () => {
        const ds = new DataSet({
          ...mockTableTreeDs(2, 3),
          autoLocateFirst: true,
          record: {
            dynamicProps: {
              defaultExpanded: false
            }
          }
        });
        expect(ds.getFromTree(0).isExpanded).toBeFalsy();
        expect(ds.getFromTree(1).isExpanded).toBeFalsy();
      })
    })
  })
})