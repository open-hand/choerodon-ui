import { ElementOf, tuple } from './type';

export const PresetStatusColorTypes = tuple('success', 'processing', 'error', 'default', 'warning');
// eslint-disable-next-line import/prefer-default-export
export const PresetColorTypes = tuple(
  'pink',
  'red',
  'yellow',
  'orange',
  'cyan',
  'green',
  'blue',
  'purple',
  'geekblue',
  'magenta',
  'volcano',
  'gold',
  'lime',
  'dark',
  'gray',
);

export type PresetColorType = ElementOf<typeof PresetColorTypes>;
export type PresetStatusColorType = ElementOf<typeof PresetStatusColorTypes>;

// eslint-disable-next-line import/prefer-default-export
export function isPresetColor(color?: string): boolean {
  color = color ? color.replace(/(-inverse$)/g,'') : color;
  return (PresetColorTypes as any[]).indexOf(color) !== -1;
}
