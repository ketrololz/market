import type { Name } from './name';

export interface CategoryItem {
  name: Name;
  id: string;
  slug: string;
  children: CategoryItem[];
}
