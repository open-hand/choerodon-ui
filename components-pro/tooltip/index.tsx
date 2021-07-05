import Tooltip from './Tooltip';
import { hide, show } from './singleton';

Tooltip.show = show;
Tooltip.hide = hide;

export default Tooltip;
