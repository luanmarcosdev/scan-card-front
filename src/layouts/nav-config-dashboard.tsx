import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Gerenciar Cartões',
    path: '/cards',
    icon: icon('ic-user'),
  },
  {
    title: 'Gerenciar Faturas',
    path: '/faturas',
    icon: icon('ic-cart'),
  },
  {
    title: 'Gerenciar Categorias',
    path: '/expense-categories',
    icon: icon('ic-blog'),
  },
];
