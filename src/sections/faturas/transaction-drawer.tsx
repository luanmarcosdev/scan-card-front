import type { Statement } from 'src/services/statements.service';
import type { Transaction } from 'src/services/transactions.service';
import type { ExpenseCategory } from 'src/services/expense-categories.service';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import useMediaQuery from '@mui/material/useMediaQuery';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { fCurrency } from 'src/utils/format-number';

import { useAuth } from 'src/auth';
import {
  getTransactionsRequest,
  deleteTransactionRequest,
} from 'src/services/transactions.service';

import { Iconify } from 'src/components/iconify';

import { emptyRows } from 'src/sections/user/utils';
import { TableNoData } from 'src/sections/user/table-no-data';
import { UserTableHead } from 'src/sections/user/user-table-head';
import { TableEmptyRows } from 'src/sections/user/table-empty-rows';

import { TransactionTableRow } from './transaction-table-row';
import { TransactionFormDialog } from './transaction-form-dialog';

// ----------------------------------------------------------------------

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const HEAD_LABEL = [
  { id: 'merchant', label: 'Estabelecimento' },
  { id: 'expense_category_id', label: 'Categoria' },
  { id: 'total_value', label: 'Total' },
  { id: 'parcels', label: 'Parcela' },
  { id: 'parcel_value', label: 'Vlr. Parcela' },
  { id: 'transaction_date', label: 'Data' },
  { id: '' },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

// ----------------------------------------------------------------------

type TxCardProps = {
  tx: Transaction;
  categories: ExpenseCategory[];
  onEdit: () => void;
  onDelete: () => void;
};

function TransactionCard({ tx, categories, onEdit, onDelete }: TxCardProps) {
  const category = categories.find((c) => c.id === tx.expense_category_id);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {tx.merchant ?? '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {category?.category ?? '—'}
            {tx.transaction_date ? ` · ${formatDate(tx.transaction_date)}` : ''}
          </Typography>
          {tx.parcels > 1 && (
            <Typography variant="caption" color="text.secondary" display="block">
              Parcela {tx.current_parcel}/{tx.parcels}
              {tx.parcel_value != null ? ` · ${fCurrency(tx.parcel_value)}/parc` : ''}
            </Typography>
          )}
        </Box>

        <Stack alignItems="flex-end" spacing={0.5} flexShrink={0}>
          <Typography variant="subtitle2">{fCurrency(tx.total_value)}</Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={onEdit}>
              <Iconify icon="solar:pen-bold" width={16} />
            </IconButton>
            <IconButton size="small" color="error" onClick={onDelete}>
              <Iconify icon="solar:trash-bin-trash-bold" width={16} />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

// ----------------------------------------------------------------------

type TransactionDrawerProps = {
  open: boolean;
  cardId: string;
  statement: Statement | null;
  categories: ExpenseCategory[];
  onClose: () => void;
};

export function TransactionDrawer({
  open,
  cardId,
  statement,
  categories,
  onClose,
}: TransactionDrawerProps) {
  const { token } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!statement) return;
    setLoading(true);
    try {
      const data = await getTransactionsRequest(token!, cardId, statement.id);
      setTransactions(data);
    } finally {
      setLoading(false);
    }
  }, [token, cardId, statement]);

  useEffect(() => {
    if (open && statement) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [open, statement, fetchTransactions]);

  const handleEdit = useCallback((tx: Transaction) => {
    setEditingTx(tx);
    setFormOpen(true);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingTx(null);
    setFormOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setFormOpen(false);
    fetchTransactions();
  }, [fetchTransactions]);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDeleteId || !statement) return;
    setDeleting(true);
    try {
      await deleteTransactionRequest(token!, cardId, statement.id, confirmDeleteId);
      setConfirmDeleteId(null);
      fetchTransactions();
    } finally {
      setDeleting(false);
    }
  }, [confirmDeleteId, token, cardId, statement, fetchTransactions]);

  const monthYear = statement
    ? `${MONTH_NAMES[statement.month_reference - 1]}/${statement.year_reference}`
    : '';

  return (
    <>
      <Dialog open={open} onClose={onClose} fullScreen={isMobile} maxWidth="md" fullWidth>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h6">Transações</Typography>
            {monthYear && (
              <Typography variant="body2" color="text.secondary">
                {monthYear}
              </Typography>
            )}
          </Box>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Button
              size="small"
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenCreate}
            >
              Nova
            </Button>
            <IconButton onClick={onClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </Box>

        <Divider />

        <DialogContent sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : isMobile ? (
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {transactions.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Nenhuma transação encontrada.
                </Typography>
              ) : (
                transactions.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    tx={tx}
                    categories={categories}
                    onEdit={() => handleEdit(tx)}
                    onDelete={() => setConfirmDeleteId(tx.id)}
                  />
                ))
              )}
            </Stack>
          ) : (
            <TableContainer>
              <Table size="small">
                <UserTableHead
                  order="asc"
                  orderBy=""
                  rowCount={transactions.length}
                  numSelected={0}
                  onSort={() => {}}
                  onSelectAllRows={() => {}}
                  headLabel={HEAD_LABEL}
                  showCheckbox={false}
                />
                <TableBody>
                  {transactions.map((tx) => (
                    <TransactionTableRow
                      key={tx.id}
                      row={tx}
                      categories={categories}
                      onEdit={() => handleEdit(tx)}
                      onDelete={() => setConfirmDeleteId(tx.id)}
                    />
                  ))}

                  <TableEmptyRows
                    height={56}
                    emptyRows={emptyRows(0, transactions.length || 5, transactions.length)}
                  />

                  {!loading && transactions.length === 0 && (
                    <TableNoData searchQuery="" />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {statement && (
        <TransactionFormDialog
          open={formOpen}
          cardId={cardId}
          statementId={statement.id}
          editingTransaction={editingTx}
          categories={categories}
          onClose={() => setFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta transação? Esta ação não poderá ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
