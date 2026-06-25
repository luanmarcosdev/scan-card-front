import { Icon } from '@iconify/react';

// ----------------------------------------------------------------------

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
    icon: <Icon icon="solar:chart-2-bold-duotone" width={24} />,
  },
  {
    title: 'Gerenciar Cartões',
    path: '/cards',
    icon: <Icon icon="solar:card-bold-duotone" width={24} />,
  },
  {
    title: 'Gerenciar Faturas',
    path: '/faturas',
    icon: <Icon icon="solar:camera-add-bold-duotone" width={24} />,
  },
  {
    title: 'Gerenciar Categorias',
    path: '/expense-categories',
    icon: <Icon icon="solar:tag-bold-duotone" width={24} />,
  },
];
