import * as React from 'react';
import classNames from 'classnames';
import { Row, Col, ColProps } from '../grid';

export type ColumnCount = 1 | 2 | 3 | 4 | 6 | 8 | 12 | 24;

export type ColumnType = 'gutter' | 'column' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface SkeletonGridProps {
  prefixCls?: string;
  className?: string;
  style?: object;
  gutter?: number;
  column?: ColumnCount;
  rows?: ColumnCount;
  xs?: ColumnCount;
  sm?: ColumnCount;
  md?: ColumnCount;
  lg?: ColumnCount;
  xl?: ColumnCount;
  xxl?: ColumnCount;
}

function getGrid(grid?: SkeletonGridProps, t?: ColumnType) {
  return grid && grid[t!] && Math.floor(24 / grid[t!]!);
}

const Grid = (props: SkeletonGridProps) => {
  const renderContent = () => {
    const { column, prefixCls } = props;
    if (column) {
      let col = column;
      const cols: React.ReactElement<ColProps>[] = [];
      while (col && col > 0) {
        cols.push(
          <Col
            span={getGrid(props, 'column')}
            xs={getGrid(props, 'xs')}
            sm={getGrid(props, 'sm')}
            md={getGrid(props, 'md')}
            lg={getGrid(props, 'lg')}
            xl={getGrid(props, 'xl')}
            xxl={getGrid(props, 'xxl')}
          >
            <div className={`${prefixCls}-content`} />
          </Col>,
        );
        col--;
      }
      return cols;
    }
    return <Col>
      <div className={`${prefixCls}-content`} />
    </Col>;
  };

  const { prefixCls, className, style, rows, gutter } = props;
  const rowList = (
    <Row gutter={gutter}>
      {[...Array(rows)].map(() => renderContent())}
    </Row>
  );
  return (
    <div className={classNames(prefixCls, className)} style={style}>
      {rowList}
    </div>
  );
};

export default Grid;
