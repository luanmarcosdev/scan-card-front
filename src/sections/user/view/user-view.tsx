import type { Card } from 'src/services/cards.service';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

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

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteCardRequest(token!, id);
      fetchCards();
    },
    [token, fetchCards]
  );

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
              onDelete={() => handleDelete(card.id)}
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
    </DashboardContent>
  );
}
