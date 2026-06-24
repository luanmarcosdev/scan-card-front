import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type CardAddItemProps = {
  onClick: () => void;
};

export function CardAddItem({ onClick }: CardAddItemProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 320,
        aspectRatio: '1.586',
        borderRadius: 2,
        border: '2px dashed',
        borderColor: 'text.disabled',
        opacity: 0.5,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        transition: 'opacity 0.2s',
        '&:hover': { opacity: 0.8 },
      }}
    >
      <Iconify icon="mingcute:add-line" width={32} />
      <Typography variant="body2">Novo cartão</Typography>
    </Box>
  );
}
