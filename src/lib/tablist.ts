/**
 * Wires an ARIA tablist (WAI-ARIA APG, automatic activation): click, ←/→ (↑/↓ too), Home/End,
 * roving tabindex. `onSelect` does the switching (panels, radar morph…). Used by Tabs and Radar.
 */
export type Tablist = {
  tabs: HTMLElement[];
  readonly index: number;
  select(i: number, focus?: boolean): void;
};

export function bindTablist(
  list: HTMLElement,
  onSelect: (index: number, tab: HTMLElement) => void,
): Tablist {
  const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
  let index = Math.max(
    0,
    tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'),
  );

  function select(i: number, focus = false) {
    const next = (i + tabs.length) % tabs.length;
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(j === next));
      t.tabIndex = j === next ? 0 : -1;
    });
    if (focus) tabs[next]?.focus();
    if (next === index) return;
    index = next;
    onSelect(next, tabs[next]!);
  }

  list.addEventListener('click', (e) => {
    const tab = (e.target as HTMLElement).closest<HTMLElement>('[role="tab"]');
    if (tab) select(tabs.indexOf(tab));
  });
  list.addEventListener('keydown', (e) => {
    const step: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    let next: number | undefined;
    if (e.key in step) next = index + step[e.key]!;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    e.preventDefault();
    select(next, true);
  });

  return {
    tabs,
    get index() {
      return index;
    },
    select,
  };
}
