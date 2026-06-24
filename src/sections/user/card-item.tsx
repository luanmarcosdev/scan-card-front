import type { Card } from 'src/services/cards.service';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type CardItemProps = {
  card: Card;
  onEdit: () => void;
  onDelete: () => void;
};

export function CardItem({ card, onEdit, onDelete }: CardItemProps) {
  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        width: 320,
        aspectRatio: '1.586',
        borderRadius: 2,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.vars.palette.primary.main} 0%, ${theme.vars.palette.primary.darker} 100%)`,
        color: 'white',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: theme.shadows[8],
        '&:hover .card-actions': { opacity: 1 },
      })}
    >
      <Typography variant="subtitle1" fontWeight="bold" noWrap>
        {card.name ?? (
          <Box component="span" sx={{ fontStyle: 'italic', opacity: 0.6 }}>
            Sem nome
          </Box>
        )}
      </Typography>

      <Typography variant="h6" letterSpacing={2}>
        **** **** **** {card.last_numbers}
      </Typography>

      {/* Hover actions overlay */}
      <Box
        className="card-actions"
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          opacity: 0,
          transition: 'opacity 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <IconButton onClick={onEdit} sx={{ color: 'white' }}>
          <Iconify icon="solar:pen-bold" width={24} />
        </IconButton>
        <IconButton onClick={onDelete} sx={{ color: 'error.light' }}>
          <Iconify icon="solar:trash-bin-trash-bold" width={24} />
        </IconButton>
      </Box>
    </Box>
  );
}
