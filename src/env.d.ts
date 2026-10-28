/**
 * Globals shared between client scripts. Each is set once and survives view transitions.
 */
interface LoaderApi {
  /** call before starting work the loader should wait for (M3: the 3D scene) */
  expect(): void;
  /** 0..1 */
  progress(value: number): void;
  done(): void;
}

interface Window {
  /** loading screen API (components/world/Loader.astro) */
  __loader?: LoaderApi;
  /** guards so document-level listeners bind once */
  __travelBound?: boolean;
  __warpBound?: boolean;
  __loaderBound?: boolean;
  __keyPromptBound?: boolean;
  __tabKeysBound?: boolean;
}
