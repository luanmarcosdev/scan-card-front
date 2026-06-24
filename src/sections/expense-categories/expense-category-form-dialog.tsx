import type { ChangeEvent } from 'react';
import type { ExpenseCategory } from 'src/services/expense-categories.service';

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
import {
  createExpenseCategoryRequest,
  updateExpenseCategoryRequest,
} from 'src/services/expense-categories.service';

// ----------------------------------------------------------------------

type ExpenseCategoryFormDialogProps = {
  open: boolean;
  editingCategory: ExpenseCategory | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function ExpenseCategoryFormDialog({
  open,
  editingCategory,
  onClose,
  onSuccess,
}: ExpenseCategoryFormDialogProps) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ category: '', description: '' });

  useEffect(() => {
    if (open) {
      setError(null);
      setForm({
        category: editingCategory?.category ?? '',
        description: editingCategory?.description ?? '',
      });
    }
  }, [open, editingCategory]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        category: form.category,
        ...(form.description ? { description: form.description } : {}),
      };
      if (editingCategory) {
        await updateExpenseCategoryRequest(token!, editingCategory.id, payload);
      } else {
        await createExpenseCategoryRequest(token!, payload);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }, [form, editingCategory, token, onSuccess]);

  const isEdit = !!editingCategory;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth
            name="category"
            label="Nome"
            value={form.category}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            fullWidth
            name="description"
            label="Descrição (opcional)"
            value={form.description}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mt: 2.5 }}
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
          disabled={loading || !form.category.trim()}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
