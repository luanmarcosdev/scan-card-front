import { Icon } from '@iconify/react';

import IconButton from '@mui/material/IconButton';
import { useColorScheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function ThemeToggle() {
  const { mode, setMode } = useColorScheme();

  return (
    <IconButton
      onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
      sx={{ color: 'text.primary' }}
    >
      <Icon icon={mode === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold'} width={22} />
    </IconButton>
  );
}
