import { Iconify } from 'src/components/iconify';

import type { AccountPopoverProps } from './components/account-popover';

// ----------------------------------------------------------------------

export const _account: AccountPopoverProps['data'] = [
  {
    label: 'Minha Conta',
    href: '#',
    icon: <Iconify width={22} icon="solar:shield-keyhole-bold-duotone" />,
  },
  // {
  //   label: 'Settings',
  //   href: '#',
  //   icon: <Iconify width={22} icon="solar:settings-bold-duotone" />,
  // },
];
