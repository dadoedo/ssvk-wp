import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { pagesApi } from '../api/client';
import { buildMenu, getMenuChildrenForPath, type MenuItem, type PageTreeItem } from '../lib/menu';

interface MenuContextValue {
  menuConfig: MenuItem[];
  isLoading: boolean;
  getMenuChildrenForPath: (path: string) => MenuItem[] | null;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuConfig, setMenuConfig] = useState<MenuItem[]>(() => buildMenu([]));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    pagesApi
      .tree(true)
      .then((pages: PageTreeItem[]) => {
        setMenuConfig(buildMenu(pages));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const value: MenuContextValue = {
    menuConfig,
    isLoading,
    getMenuChildrenForPath: (path: string) => getMenuChildrenForPath(menuConfig, path),
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
}
