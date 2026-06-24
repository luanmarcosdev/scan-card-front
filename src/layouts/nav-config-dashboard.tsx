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
    title: 'Cartoes',
    path: '/cards',
    icon: icon('ic-user'),
  },
  {
    title: 'Faturas',
    path: '/faturas',
    icon: icon('ic-cart'),
  },
  {
    title: 'Categorias',
    path: '/expense-categories',
    icon: icon('ic-blog'),
  },
];
