import type { ChangeEvent } from 'react';
import type { Statement, UpdateStatementPayload } from 'src/services/statements.service';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useAuth } from 'src/auth';
import {
  createStatementRequest,
  updateStatementRequest,
} from 'src/services/statements.service';

// ----------------------------------------------------------------------

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

// ----------------------------------------------------------------------

type StatementFormDialogProps = {
  open: boolean;
  cardId: string;
  editingStatement: Statement | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function StatementFormDialog({
  open,
  cardId,
  editingStatement,
  onClose,
  onSuccess,
}: StatementFormDialogProps) {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    month_reference: currentMonth,
    year_reference: currentYear,
    total: '',
  });

  const isEdit = !!editingStatement;

  useEffect(() => {
    if (open) {
      setError(null);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setForm({
        month_reference: editingStatement?.month_reference ?? currentMonth,
        year_reference: editingStatement?.year_reference ?? currentYear,
        total: editingStatement?.total != null ? String(editingStatement.total) : '',
      });
    }
  }, [open, editingStatement]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(Array.from(e.target.files ?? []));
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      if (isEdit) {
        const payload: UpdateStatementPayload = {};
        if (form.total !== '') payload.total = Number(form.total);
        await updateStatementRequest(token!, cardId, editingStatement!.id, payload);
      } else {
        const fd = new FormData();
        fd.append('month_reference', String(form.month_reference));
        fd.append('year_reference', String(form.year_reference));
        if (form.total !== '') fd.append('total', String(form.total));
        selectedFiles.forEach((f) => fd.append('images[]', f));
        await createStatementRequest(token!, cardId, fd);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }, [form, isEdit, editingStatement, cardId, token, selectedFiles, onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar fatura' : 'Nova fatura'}</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {!isEdit && (
            <>
              <FormControl fullWidth>
                <InputLabel id="month-label">Mês</InputLabel>
                <Select
                  labelId="month-label"
                  label="Mês"
                  value={form.month_reference}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, month_reference: Number(e.target.value) }))
                  }
                >
                  {MONTHS.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                name="year_reference"
                label="Ano"
                type="number"
                value={form.year_reference}
                onChange={handleChange}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </>
          )}

          <TextField
            fullWidth
            name="total"
            label="Total (opcional)"
            type="number"
            value={form.total}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true }, input: { inputProps: { min: 0, step: '0.01' } } }}
            placeholder="0,00"
          />

          {!isEdit && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Imagens do extrato (opcional)
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                style={{ width: '100%' }}
              />
              {selectedFiles.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {selectedFiles.length} arquivo(s) selecionado(s)
                </Typography>
              )}
            </Box>
          )}
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
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
