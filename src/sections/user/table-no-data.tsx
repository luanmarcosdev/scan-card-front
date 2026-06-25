import type { TableRowProps } from '@mui/material/TableRow';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type TableNoDataProps = TableRowProps & {
  searchQuery: string;
  title?: string;
  description?: string;
};

export function TableNoData({ searchQuery, title, description, ...other }: TableNoDataProps) {
  const hasSearch = !!searchQuery;

  return (
    <TableRow {...other}>
      <TableCell align="center" colSpan={7}>
        <Box sx={{ py: 15, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {hasSearch ? 'Não encontrado' : (title ?? 'Nenhum item encontrado')}
          </Typography>

          <Typography variant="body2">
            {hasSearch ? (
              <>
                Sem resultados para&nbsp;
                <strong>&quot;{searchQuery}&quot;</strong>.
                <br />
                Tente verificar se há erros de digitação ou use palavras completas.
              </>
            ) : (
              description ?? 'Nenhum item cadastrado ainda.'
            )}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}
