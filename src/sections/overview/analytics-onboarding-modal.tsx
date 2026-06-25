import { useState } from 'react';
import { Icon } from '@iconify/react';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

const STEPS = [
  {
    label: 'Cartão',
    icon: 'solar:card-bold-duotone',
    color: '#1877F2',
    title: 'Cadastre seu primeiro cartão',
    description:
      'Comece adicionando um cartão de crédito. Você pode ter múltiplos cartões e acompanhar os gastos de cada um separadamente ou consolidados.',
    action: { label: 'Cadastrar cartão', href: '/cards' },
  },
  {
    label: 'Categorias',
    icon: 'solar:tag-bold-duotone',
    color: '#FF5630',
    title: 'Crie suas categorias de gasto',
    description:
      'As categorias personalizam como seus gastos são organizados — alimentação, transporte, lazer, etc. O dashboard agrupa tudo por categoria para você entender exatamente onde o dinheiro está indo.',
    action: { label: 'Criar categorias', href: '/expense-categories' },
  },
  {
    label: 'Fatura',
    icon: 'solar:camera-add-bold-duotone',
    color: '#22C55E',
    title: 'Envie sua primeira fatura',
    description:
      'Fotografe ou tire print de cada página da sua fatura do cartão e envie aqui. Nossa IA lê as imagens e extrai todas as transações automaticamente. Quanto mais completa a fatura, mais precisos serão os seus insights no dashboard.',
    action: { label: 'Enviar fatura', href: '/faturas' },
  },
];

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AnalyticsOnboardingModal({ open, onClose }: Props) {
  const [activeStep, setActiveStep] = useState(0);

  const step = STEPS[activeStep];
  const isLast = activeStep === STEPS.length - 1;

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogContent sx={{ pt: 4, pb: 2, px: { xs: 3, sm: 5 } }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={0.5}>
          Bem-vindo ao ScanCard
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
          Siga os passos abaixo para começar a usar o dashboard
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
          {STEPS.map((s, i) => (
            <Step key={s.label} completed={i < activeStep}>
              <StepLabel>{s.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Stack alignItems="center" spacing={2.5} sx={{ py: 2 }}>
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: `${step.color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon icon={step.icon} width={52} color={step.color} />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" mb={1}>
              {step.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mx: 'auto' }}>
              {step.description}
            </Typography>
          </Box>

          <Button
            component={RouterLink}
            href={step.action.href}
            variant="contained"
            size="large"
            startIcon={<Icon icon="solar:arrow-right-bold" />}
            sx={{ mt: 1, px: 4 }}
          >
            {step.action.label}
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 3, sm: 5 }, pb: 3, justifyContent: 'space-between' }}>
        <Button
          color="inherit"
          onClick={activeStep === 0 ? onClose : () => setActiveStep((s) => s - 1)}
        >
          {activeStep === 0 ? 'Fechar' : 'Voltar'}
        </Button>

        {!isLast && (
          <Button variant="outlined" onClick={() => setActiveStep((s) => s + 1)}>
            Próximo
          </Button>
        )}

        {isLast && (
          <Button variant="outlined" onClick={onClose}>
            Entendi
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
