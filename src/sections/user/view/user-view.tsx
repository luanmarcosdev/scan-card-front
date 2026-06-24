import type { Card } from 'src/services/cards.service';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { useAuth } from 'src/auth';
import { DashboardContent } from 'src/layouts/dashboard';
import { getCardsRequest, deleteCardRequest } from 'src/services/cards.service';

import { CardItem } from '../card-item';
import { CardAddItem } from '../card-add-item';
import { CardFormDialog } from '../card-form-dialog';

// ----------------------------------------------------------------------

export function UserView() {
  const { token } = useAuth();

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCardsRequest(token!);
      setCards(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleEdit = useCallback((card: Card) => {
    setEditingCard(card);
    setDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await deleteCardRequest(token!, confirmDeleteId);
      setConfirmDeleteId(null);
      fetchCards();
    } finally {
      setDeleting(false);
    }
  }, [confirmDeleteId, token, fetchCards]);

  const handleOpenCreate = useCallback(() => {
    setEditingCard(null);
    setDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    setDialogOpen(false);
    fetchCards();
  }, [fetchCards]);

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Cartões
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onEdit={() => handleEdit(card)}
              onDelete={() => setConfirmDeleteId(card.id)}
            />
          ))}
          <CardAddItem onClick={handleOpenCreate} />
        </Box>
      )}

      <CardFormDialog
        open={dialogOpen}
        editingCard={editingCard}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleDialogSuccess}
      />

      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este cartão? Esta ação não poderá ser desfeita.
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
