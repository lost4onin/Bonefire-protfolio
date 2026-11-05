/**
 * Palette A for the 3D scenes, read from the CSS tokens (single source of truth: src/styles/tokens.css).
 * Shared by the landing's BonfireScene and the /works RelicScene.
 */
import { Color } from 'three';

export interface Palette {
  void: Color;
  ash: Color;
  stone: Color;
  ember: Color;
  emberDeep: Color;
}

export function paletteFromTokens(): Palette {
  const css = getComputedStyle(document.documentElement);
  const c = (token: string) => new Color(css.getPropertyValue(token).trim() || '#000');
  return {
    void: c('--c-void'),
    ash: c('--c-ash'),
    stone: c('--c-stone'),
    ember: c('--c-ember'),
    emberDeep: c('--c-ember-deep'),
  };
}
