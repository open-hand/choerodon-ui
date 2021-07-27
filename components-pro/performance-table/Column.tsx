import PropTypes from 'prop-types';
import { ColumnProps } from './Column.d';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Column(_props: ColumnProps) {
  return null;
}

Column.defaultProps = {
  width: 100,
  hideable: true,
  hidden: false,
  fixed: false,
  sortable: false,
};

Column.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom']),
  width: PropTypes.number,
  fixed: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['left', 'right'])]),
  resizable: PropTypes.bool,
  sortable: PropTypes.bool,
  flexGrow: PropTypes.number,
  minWidth: PropTypes.number,
  colSpan: PropTypes.number,
  sort: PropTypes.number,
  treeCol: PropTypes.bool,
  hidden: PropTypes.bool,
  hideable: PropTypes.bool,
  titleEditable: PropTypes.bool,
  onResize: PropTypes.func,
  render: PropTypes.func,
  dataIndex: PropTypes.string,
};

Column.__PFM_TABLE_COLUMN = true;

export default Column;
