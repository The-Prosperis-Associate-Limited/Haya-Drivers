export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  // Present only on people (null when they have no photo); documents and pages omit it.
  avatar?: string | null;
}

export interface SearchGroup {
  key: string;
  label: string;
  items: SearchItem[];
}
