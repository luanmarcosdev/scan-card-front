import type { ChangeEvent } from 'react';
import type { ExpenseCategory } from 'src/services/expense-categories.service';
import type { Transaction, TransactionPayload } from 'src/services/transactions.service';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useAuth } from 'src/auth';
import {
  createTransactionRequest,
  updateTransactionRequest,
} from 'src/services/transactions.service';

// ----------------------------------------------------------------------

type TransactionFormDialogProps = {
  open: boolean;
  cardId: string;
  statementId: string;
  editingTransaction: Transaction | null;
  categories: ExpenseCategory[];
  onClose: () => void;
  onSuccess: () => void;
};

export function TransactionFormDialog({
  open,
  cardId,
  statementId,
  editingTransaction,
  categories,
  onClose,
  onSuccess,
}: TransactionFormDialogProps) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    expense_category_id: '',
    total_value: '',
    merchant: '',
    transaction_date: '',
    parcels: '',
    current_parcel: '',
    parcel_value: '',
  });

  const isEdit = !!editingTransaction;

  useEffect(() => {
    if (open) {
      setError(null);
      setForm({
        expense_category_id: editingTransaction?.expense_category_id ?? '',
        total_value: editingTransaction?.total_value != null ? String(editingTransaction.total_value) : '',
        merchant: editingTransaction?.merchant ?? '',
        transaction_date: editingTransaction?.transaction_date ?? '',
        parcels: editingTransaction?.parcels != null ? String(editingTransaction.parcels) : '',
        current_parcel: editingTransaction?.current_parcel != null ? String(editingTransaction.current_parcel) : '',
        parcel_value: editingTransaction?.parcel_value != null ? String(editingTransaction.parcel_value) : '',
      });
    }
  }, [open, editingTransaction]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const payload: TransactionPayload = {
        expense_category_id: form.expense_category_id,
        total_value: Number(form.total_value),
        ...(form.merchant ? { merchant: form.merchant } : {}),
        ...(form.transaction_date ? { transaction_date: form.transaction_date } : {}),
        ...(form.parcels ? { parcels: Number(form.parcels) } : {}),
        ...(form.current_parcel ? { current_parcel: Number(form.current_parcel) } : {}),
        ...(form.parcel_value ? { parcel_value: Number(form.parcel_value) } : {}),
      };

      if (isEdit) {
        await updateTransactionRequest(token!, cardId, statementId, editingTransaction!.id, payload);
      } else {
        await createTransactionRequest(token!, cardId, statementId, payload);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }, [form, isEdit, editingTransaction, cardId, statementId, token, onSuccess]);

  const canSubmit = !!form.expense_category_id && !!form.total_value;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar transação' : 'Nova transação'}</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth>
            <InputLabel id="category-label">Categoria</InputLabel>
            <Select
              labelId="category-label"
              label="Categoria"
              value={form.expense_category_id}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, expense_category_id: String(e.target.value) }))
              }
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            name="total_value"
            label="Valor total"
            type="number"
            value={form.total_value}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true }, input: { inputProps: { min: 0, step: '0.01' } } }}
          />

          <TextField
            fullWidth
            name="merchant"
            label="Estabelecimento (opcional)"
            value={form.merchant}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            fullWidth
            name="transaction_date"
            label="Data (opcional)"
            type="date"
            value={form.transaction_date}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              fullWidth
              name="parcels"
              label="Parcelas"
              type="number"
              value={form.parcels}
              onChange={handleChange}
              slotProps={{ inputLabel: { shrink: true }, input: { inputProps: { min: 1 } } }}
              placeholder="1"
            />
            <TextField
              fullWidth
              name="current_parcel"
              label="Parcela atual"
              type="number"
              value={form.current_parcel}
              onChange={handleChange}
              slotProps={{ inputLabel: { shrink: true }, input: { inputProps: { min: 1 } } }}
              placeholder="1"
            />
          </Box>

          <TextField
            fullWidth
            name="parcel_value"
            label="Valor da parcela (opcional)"
            type="number"
            value={form.parcel_value}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true }, input: { inputProps: { min: 0, step: '0.01' } } }}
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
          disabled={loading || !canSubmit}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
