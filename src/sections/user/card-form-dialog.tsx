import type { ChangeEvent } from 'react';
import type { Card } from 'src/services/cards.service';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useAuth } from 'src/auth';
import { createCardRequest, updateCardRequest } from 'src/services/cards.service';

// ----------------------------------------------------------------------

type CardFormDialogProps = {
  open: boolean;
  editingCard: Card | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function CardFormDialog({ open, editingCard, onClose, onSuccess }: CardFormDialogProps) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ last_numbers: '', name: '' });

  useEffect(() => {
    if (open) {
      setError(null);
      setForm({
        last_numbers: editingCard?.last_numbers ?? '',
        name: editingCard?.name ?? '',
      });
    }
  }, [open, editingCard]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!editingCard && !/^\d{4}$/.test(form.last_numbers)) {
      setError('Os últimos 4 dígitos devem ser exatamente 4 números');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (editingCard) {
        await updateCardRequest(token!, editingCard.id, { name: form.name || null });
      } else {
        await createCardRequest(token!, {
          last_numbers: form.last_numbers,
          ...(form.name ? { name: form.name } : {}),
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }, [form, editingCard, token, onSuccess]);

  const isEdit = !!editingCard;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar cartão' : 'Novo cartão'}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            name="last_numbers"
            label="Últimos 4 dígitos"
            value={form.last_numbers}
            onChange={handleChange}
            disabled={isEdit}
            inputProps={{ maxLength: 4 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            fullWidth
            name="name"
            label="Nome do cartão (opcional)"
            value={form.name}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="inherit"
          onClick={handleSubmit}
          disabled={loading || (!isEdit && !form.last_numbers)}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
