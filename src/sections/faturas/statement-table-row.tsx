import type { Statement } from 'src/services/statements.service';

import { useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

const STATUS_MAP: Record<number, { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error' }> = {
  1: { label: 'Pendente', color: 'default' },
  2: { label: 'Enviado', color: 'info' },
  3: { label: 'Processando', color: 'warning' },
  4: { label: 'Processado', color: 'success' },
  5: { label: 'Reprocessando', color: 'warning' },
  6: { label: 'Erro', color: 'error' },
  7: { label: 'Revisar', color: 'warning' },
};

// ----------------------------------------------------------------------

type StatementTableRowProps = {
  row: Statement;
  onRowClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function StatementTableRow({ row, onRowClick, onEdit, onDelete }: StatementTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const status = STATUS_MAP[Number(row.status_id)] ?? { label: 'Desconhecido', color: 'default' as const };
  const monthYear = `${MONTH_NAMES[row.month_reference - 1]}/${row.year_reference}`;

  return (
    <>
      <TableRow hover tabIndex={-1} onClick={onRowClick} sx={{ cursor: 'pointer' }}>
        <TableCell>{monthYear}</TableCell>

        <TableCell>{row.total != null ? fCurrency(row.total) : '—'}</TableCell>

        <TableCell>
          <Chip label={status.label} color={status.color} size="small" />
        </TableCell>

        <TableCell>{fDate(row.created_at)}</TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleClosePopover();
              onEdit();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleClosePopover();
              onDelete();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Deletar
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
