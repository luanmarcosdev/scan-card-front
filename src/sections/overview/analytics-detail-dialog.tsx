import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';

import {
  type PurchaseTransaction,
  getAnalyticsTransactionsRequest,
} from 'src/services/analytics.service';

// ----------------------------------------------------------------------

type TransactionParams = {
  month?: number;
  year?: number;
  card_id?: string;
  category_id?: string;
  type?: 'cash' | 'installments' | 'ends_this_month' | 'ends_next_month' | 'ends_within_3_months';
};

type Props = {
  open: boolean;
  title: string;
  token: string;
  params: TransactionParams;
  onClose: () => void;
};

// ----------------------------------------------------------------------

export function AnalyticsDetailDialog({ open, title, token, params, onClose }: Props) {
  const [rows, setRows] = useState<PurchaseTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAnalyticsTransactionsRequest(token, params);
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, params]);

  useEffect(() => {
    if (open) fetchTransactions();
    else setRows([]);
  }, [open, fetchTransactions]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Typography sx={{ p: 3, color: 'text.secondary' }}>
            Nenhuma transação encontrada.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Descrição</TableCell>
                <TableCell>Cartão</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell align="center">Parcela</TableCell>
                <TableCell align="right">Valor da parcela</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.transaction_id} hover>
                  <TableCell>{row.merchant ?? '—'}</TableCell>
                  <TableCell>{row.card_name ?? `****${row.card_last_numbers}`}</TableCell>
                  <TableCell>{row.expense_category_name}</TableCell>
                  <TableCell align="center">
                    {row.current_parcel}/{row.parcels}
                  </TableCell>
                  <TableCell align="right">
                    {row.parcel_value !== null ? fCurrency(row.parcel_value) : '—'}
                  </TableCell>
                  <TableCell align="right">{fCurrency(row.total_value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
