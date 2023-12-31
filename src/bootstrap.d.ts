declare namespace bootstrap {
  declare class Modal {
    static getInstance(elem: HTMLElement): Modal
    hide(): void
  }

  declare class Tooltip {
    static getOrCreateInstance(elem: HTMLElement): Tooltip
    toggle(): void
  }
}
