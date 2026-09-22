export interface ThemeMetadata {
  id: string;
  label: string;
  price: number;
}

export const THEMES: ThemeMetadata[] = [
  { id: 'classique', label: 'Classique', price: 0 },
  { id: 'moderne', label: 'Moderne', price: 1000 },
  { id: 'professional', label: 'Professionnel', price: 1000 },
  { id: 'tokyo', label: 'Tokyo', price: 1000 },
  { id: 'dakar', label: 'Dakar', price: 1000 },
  { id: 'abidjan', label: 'Abidjan', price: 1500 },
  { id: 'creatif', label: 'Créatif', price: 1500 },
];
