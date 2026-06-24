import type { Statement } from 'src/services/statements.service';
import type { Card as CardData } from 'src/services/cards.service';
import type { ExpenseCategory } from 'src/services/expense-categories.service';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { useAuth } from 'src/auth';
import { DashboardContent } from 'src/layouts/dashboard';
import { getCardsRequest } from 'src/services/cards.service';
import { getExpenseCategoriesRequest } from 'src/services/expense-categories.service';
import { getStatementsRequest, deleteStatementRequest } from 'src/services/statements.service';

import { Iconify } from 'src/components/iconify';

import { emptyRows } from 'src/sections/user/utils';
import { TableNoData } from 'src/sections/user/table-no-data';
import { UserTableHead } from 'src/sections/user/user-table-head';
import { TableEmptyRows } from 'src/sections/user/table-empty-rows';

import { TransactionDrawer } from '../transaction-drawer';
import { StatementTableRow } from '../statement-table-row';
import { StatementFormDialog } from '../statement-form-dialog';

// ----------------------------------------------------------------------

const HEAD_LABEL = [
  { id: 'month_reference', label: 'Mês/Ano' },
  { id: 'total', label: 'Total' },
  { id: 'status_id', label: 'Status' },
  { id: 'created_at', label: 'Criado em' },
  { id: '' },
];

// ----------------------------------------------------------------------

export function FaturasView() {
  const { token } = useAuth();

  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingStatements, setLoadingStatements] = useState(false);
  const [statementDialogOpen, setStatementDialogOpen] = useState(false);
  const [editingStatement, setEditingStatement] = useState<Statement | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<Statement | null>(null);

  useEffect(() => {
    async function init() {
      setLoadingCards(true);
      try {
        const [cardsData, categoriesData] = await Promise.all([
          getCardsRequest(token!),
          getExpenseCategoriesRequest(token!),
        ]);
        setCards(cardsData);
        setCategories(categoriesData);
        if (cardsData.length > 0) setSelectedCardId(cardsData[0].id);
      } finally {
        setLoadingCards(false);
      }
    }
    init();
  }, [token]);

  const fetchStatements = useCallback(async () => {
    if (!selectedCardId) return;
    setLoadingStatements(true);
    try {
      const data = await getStatementsRequest(token!, selectedCardId);
      setStatements(data);
    } finally {
      setLoadingStatements(false);
    }
  }, [token, selectedCardId]);

  useEffect(() => {
    if (selectedCardId) fetchStatements();
  }, [selectedCardId, fetchStatements]);

  const handleEdit = useCallback((statement: Statement) => {
    setEditingStatement(statement);
    setStatementDialogOpen(true);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingStatement(null);
    setStatementDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    setStatementDialogOpen(false);
    fetchStatements();
  }, [fetchStatements]);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDeleteId || !selectedCardId) return;
    setDeleting(true);
    try {
      await deleteStatementRequest(token!, selectedCardId, confirmDeleteId);
      setConfirmDeleteId(null);
      fetchStatements();
    } finally {
      setDeleting(false);
    }
  }, [confirmDeleteId, selectedCardId, token, fetchStatements]);

  const cardTabLabel = (card: CardData) =>
    `•••• ${card.last_numbers}${card.name ? ` ${card.name}` : ''}`;

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Faturas</Typography>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
          disabled={!selectedCardId}
        >
          Nova fatura
        </Button>
      </Box>

      {loadingCards ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : cards.length === 0 ? (
        <Typography color="text.secondary">
          Nenhum cartão cadastrado. Adicione um cartão primeiro.
        </Typography>
      ) : (
        <>
          <Tabs
            value={selectedCardId}
            onChange={(_, val) => setSelectedCardId(val)}
            sx={{ mb: 3 }}
          >
            {cards.map((card) => (
              <Tab key={card.id} value={card.id} label={cardTabLabel(card)} />
            ))}
          </Tabs>

          <Card>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 500 }}>
                <UserTableHead
                  order="asc"
                  orderBy=""
                  rowCount={statements.length}
                  numSelected={0}
                  onSort={() => {}}
                  onSelectAllRows={() => {}}
                  headLabel={HEAD_LABEL}
                  showCheckbox={false}
                />

                <TableBody>
                  {loadingStatements ? (
                    <TableEmptyRows height={68} emptyRows={5} />
                  ) : (
                    statements.map((row) => (
                      <StatementTableRow
                        key={row.id}
                        row={row}
                        onRowClick={() => setSelectedStatement(row)}
                        onEdit={() => handleEdit(row)}
                        onDelete={() => setConfirmDeleteId(row.id)}
                      />
                    ))
                  )}

                  <TableEmptyRows
                    height={68}
                    emptyRows={emptyRows(0, statements.length || 5, statements.length)}
                  />

                  {!loadingStatements && statements.length === 0 && (
                    <TableNoData searchQuery="" />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}

      {selectedCardId && (
        <StatementFormDialog
          open={statementDialogOpen}
          cardId={selectedCardId}
          editingStatement={editingStatement}
          onClose={() => setStatementDialogOpen(false)}
          onSuccess={handleDialogSuccess}
        />
      )}

      <TransactionDrawer
        open={!!selectedStatement}
        cardId={selectedCardId ?? ''}
        statement={selectedStatement}
        categories={categories}
        onClose={() => setSelectedStatement(null)}
      />

      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta fatura? Esta ação não poderá ser desfeita.
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
