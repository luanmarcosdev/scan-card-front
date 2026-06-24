import type { ExpenseCategory } from 'src/services/expense-categories.service';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import DialogContentText from '@mui/material/DialogContentText';

import { useAuth } from 'src/auth';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  getExpenseCategoriesRequest,
  deleteExpenseCategoryRequest,
} from 'src/services/expense-categories.service';

import { Iconify } from 'src/components/iconify';

import { emptyRows } from 'src/sections/user/utils';
import { TableNoData } from 'src/sections/user/table-no-data';
import { UserTableHead } from 'src/sections/user/user-table-head';
import { TableEmptyRows } from 'src/sections/user/table-empty-rows';
import { UserTableToolbar } from 'src/sections/user/user-table-toolbar';

import { ExpenseCategoryTableRow } from '../expense-category-table-row';
import { ExpenseCategoryFormDialog } from '../expense-category-form-dialog';

// ----------------------------------------------------------------------

const HEAD_LABEL = [
  { id: 'category', label: 'Nome' },
  { id: 'description', label: 'Descrição' },
  { id: 'created_at', label: 'Criado em' },
  { id: 'updated_at', label: 'Atualizado em' },
  { id: '' },
];

export function ExpenseCategoriesView() {
  const { token } = useAuth();

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('category');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExpenseCategoriesRequest(token!);
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const handleEdit = useCallback((category: ExpenseCategory) => {
    setEditingCategory(category);
    setDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await deleteExpenseCategoryRequest(token!, confirmDeleteId);
      setConfirmDeleteId(null);
      fetchCategories();
    } finally {
      setDeleting(false);
    }
  }, [confirmDeleteId, token, fetchCategories]);

  const handleOpenCreate = useCallback(() => {
    setEditingCategory(null);
    setDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    setDialogOpen(false);
    fetchCategories();
  }, [fetchCategories]);

  const dataFiltered = categories
    .filter((c) => (c.category ?? '').toLowerCase().includes(filterName.toLowerCase()))
    .slice()
    .sort((a, b) => {
      const key = orderBy as keyof ExpenseCategory;
      const aVal = a[key] ?? '';
      const bVal = b[key] ?? '';
      return order === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4">Categorias</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Usadas pela IA para categorizar transações e gerar insights ao processar faturas.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          Nova categoria
        </Button>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={0}
          filterName={filterName}
          onFilterName={(e) => {
            setFilterName(e.target.value);
            setPage(0);
          }}
          placeholder="Buscar categoria..."
        />

        <TableContainer sx={{ overflow: 'unset' }}>
          <Table sx={{ minWidth: 500 }}>
            <UserTableHead
              order={order}
              orderBy={orderBy}
              rowCount={categories.length}
              numSelected={0}
              onSort={handleSort}
              onSelectAllRows={() => {}}
              headLabel={HEAD_LABEL}
              showCheckbox={false}
            />

            <TableBody>
              {!loading &&
                dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <ExpenseCategoryTableRow
                      key={row.id}
                      row={row}
                      onEdit={() => handleEdit(row)}
                      onDelete={() => setConfirmDeleteId(row.id)}
                    />
                  ))}

              <TableEmptyRows
                height={68}
                emptyRows={emptyRows(page, rowsPerPage, categories.length)}
              />

              {notFound && <TableNoData searchQuery={filterName} />}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          page={page}
          component="div"
          count={dataFiltered.length}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      <ExpenseCategoryFormDialog
        open={dialogOpen}
        editingCategory={editingCategory}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleDialogSuccess}
      />

      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta categoria? Esta ação não poderá ser desfeita.
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
    </DashboardContent>
  );
}
