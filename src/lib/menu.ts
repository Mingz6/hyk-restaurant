import menuData from "../data/menu.json";

export interface Size {
  label: string;
  price: number;
}

export interface MenuItem {
  no: number | null;
  en: string;
  zh: string;
  price: number | null;
  sizes?: Size[];
  unit?: string;
  noteKey?: string;
  popular?: boolean;
  preorder?: boolean;
  spicy?: boolean;
}

export interface MenuSection {
  key: string;
  en: string;
  zh: string;
  items: MenuItem[];
}

export const menu = menuData as { pricesAreSample: boolean; sections: MenuSection[] };

export const itemCount = menu.sections.reduce((n, s) => n + s.items.length, 0);

export const popularItems = menu.sections.flatMap((s) => s.items.filter((i) => i.popular));

export const money = (n: number): string => `$${n}`;
