import { createContext, useContext } from 'react';
import { useLocation } from '@tanstack/react-router';
import { emptyCms } from './cms';

export const CmsContext = createContext(emptyCms);
export const useCms = () => useContext(CmsContext);

export function usePagePhoto(slot: 'hero' | 'footer', fallback?: string, alt = '') {
  const { pathname } = useLocation();
  const { pages } = useCms();
  return pages[pathname]?.[slot] ?? { src: fallback, alt };
}
