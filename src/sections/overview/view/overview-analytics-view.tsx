import { Icon } from '@iconify/react';
import { useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { useAuth } from 'src/auth';
import { DashboardContent } from 'src/layouts/dashboard';
import { type Card, getCardsRequest } from 'src/services/cards.service';
import { type AnalyticsData, getAnalyticsRequest } from 'src/services/analytics.service';

import { AnalyticsDetailDialog } from '../analytics-detail-dialog';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';
import { AnalyticsOnboardingModal } from '../analytics-onboarding-modal';

// ----------------------------------------------------------------------

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];

const EMPTY_CHART = { categories: [] as string[], series: [] as number[] };

const VENCIMENTO_TYPES = [
  'ends_this_month',
  'ends_next_month',
  'ends_within_3_months',
] as const;

const VENCIMENTO_LABELS = ['Esse mês', 'Próximo mês', 'Próximos 3 meses'];

// ----------------------------------------------------------------------

type DetailDialog = {
  title: string;
  params: {
    month?: number;
    year?: number;
    card_id?: string;
    category_id?: string;
    type?: (typeof VENCIMENTO_TYPES)[number];
  };
};

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const { user, token } = useAuth();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [cardId, setCardId] = useState<string>('');
  const [cards, setCards] = useState<Card[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<DetailDialog | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    getCardsRequest(token)
      .then((data) => {
        setCards(data);
        if (data.length === 0) setOnboardingOpen(true);
      })
      .catch(() => {});
  }, [token]);

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getAnalyticsRequest(token, {
        month,
        year,
        ...(cardId ? { card_id: cardId } : {}),
      });
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [token, month, year, cardId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const transactions = analytics?.transactions;
  const purchases = analytics?.purchases;

  const hasTransactions = (transactions?.count ?? 0) > 0;
  const general = analytics
    ? {
        ...analytics.general,
        total_due: hasTransactions ? analytics.general.total_due : 0,
        installments_salary_ratio: hasTransactions
          ? (analytics.general.installments_salary_ratio ?? 0)
          : 0,
      }
    : undefined;

  const hasCategories = (transactions?.by_category.length ?? 0) > 0;

  const categoryPieSeries = (transactions?.by_category ?? []).map((c) => ({
    label: c.category_name,
    value: c.total,
  }));

  const categorySalaryRatioCategories = (transactions?.by_category ?? []).map(
    (c) => c.category_name
  );

  const baseParams = {
    month,
    year,
    ...(cardId ? { card_id: cardId } : {}),
  };

  const handleCategoryClick = useCallback(
    (_: unknown, __: unknown, config: { dataPointIndex: number }) => {
      const category = transactions?.by_category[config.dataPointIndex];
      if (!category) return;
      setDialog({
        title: category.category_name,
        params: { ...baseParams, category_id: category.category_id },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, month, year, cardId]
  );

  const handleVencimentoClick = useCallback(
    (_: unknown, __: unknown, config: { dataPointIndex: number }) => {
      const type = VENCIMENTO_TYPES[config.dataPointIndex];
      if (!type) return;
      setDialog({
        title: `Compras — ${VENCIMENTO_LABELS[config.dataPointIndex]}`,
        params: { ...baseParams, type },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [month, year, cardId]
  );

  const categoryClickOptions = {
    chart: { events: { dataPointSelection: handleCategoryClick } },
  };

  const vencimentoClickOptions = {
    chart: { events: { dataPointSelection: handleVencimentoClick } },
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={2}
        sx={{ mb: { xs: 3, md: 5 } }}
      >
        <Typography variant="h4">Olá, {user?.name}</Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {cards.length > 0 && (
            <Select
              size="small"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Todos os cartões</MenuItem>
              {cards.map((card) => (
                <MenuItem key={card.id} value={card.id}>
                  {card.name ?? card.last_numbers}
                </MenuItem>
              ))}
            </Select>
          )}

          <Select
            size="small"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTH_NAMES.map((name, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {name}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Stack>

      {!loading && analytics !== null && (analytics.general.statements_count === 0) && (
        <Alert
          severity="warning"
          variant="filled"
          icon={<Icon icon="solar:calendar-search-bold-duotone" width={28} />}
          sx={{ mb: 3, py: 2, fontSize: 15, alignItems: 'center' }}
        >
          Nenhuma fatura ou gasto encontrado para o período selecionado.{' '}
          <Link
            component={RouterLink}
            href="/faturas"
            color="inherit"
            fontWeight="bold"
            sx={{ textDecorationColor: 'currentColor' }}
          >
            Cadastre uma fatura
          </Link>{' '}
          ou escolha outro período.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <AnalyticsWidgetSummary
            title="Total a pagar (R$)"
            total={general?.total_due ?? 0}
            color="primary"
            icon={<Icon icon="solar:wallet-money-bold-duotone" width={48} />}
            chart={EMPTY_CHART}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <AnalyticsWidgetSummary
            title="Valor médio por compra (R$)"
            total={transactions?.avg_value ?? 0}
            color="info"
            icon={<Icon icon="solar:graph-up-bold-duotone" width={48} />}
            chart={EMPTY_CHART}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <AnalyticsWidgetSummary
            title="Transações"
            total={transactions?.count ?? 0}
            color="warning"
            icon={<Icon icon="solar:transfer-horizontal-bold-duotone" width={48} />}
            chart={EMPTY_CHART}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AnalyticsCurrentVisits
            title="Salário vs Faturas"
            subheader={`${general?.installments_salary_ratio ?? 0}% do salário comprometido`}
            chart={{
              series: [
                { label: 'Em faturas', value: general?.total_installments ?? 0 },
                {
                  label: 'Disponível',
                  value: Math.max(0, (general?.salary ?? 0) - (general?.total_installments ?? 0)),
                },
              ],
            }}
          />
        </Grid>

        {hasCategories && (
          <Grid size={{ xs: 12, md: 6 }}>
            <AnalyticsCurrentVisits
              title="Gastos por categoria"
              subheader={`${transactions?.by_category.length ?? 0} categorias no período`}
              chart={{ series: categoryPieSeries, options: categoryClickOptions }}
            />
          </Grid>
        )}

        {hasCategories && (
          <Grid size={{ xs: 12, md: 6 }}>
            <AnalyticsConversionRates
              title="% do salário por categoria"
              subheader="Clique em uma categoria para ver as transações"
              chart={{
                categories: categorySalaryRatioCategories,
                series: [
                  {
                    name: '% do Salário',
                    data: (transactions?.by_category ?? []).map((c) => c.salary_ratio),
                  },
                ],
                options: categoryClickOptions,
              }}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 6 }}>
          <AnalyticsWebsiteVisits
            title="Quando as compras finalizam?"
            subheader="Clique em uma barra para ver as transações"
            chart={{
              categories: VENCIMENTO_LABELS,
              series: [
                {
                  name: 'Total (R$)',
                  data: [
                    purchases?.ends_this_month.total ?? 0,
                    purchases?.ends_next_month.total ?? 0,
                    purchases?.ends_within_3_months.total ?? 0,
                  ],
                },
              ],
              options: vencimentoClickOptions,
            }}
          />
        </Grid>
      </Grid>

      <AnalyticsOnboardingModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />

      {dialog && token && (
        <AnalyticsDetailDialog
          open
          title={dialog.title}
          token={token}
          params={dialog.params}
          onClose={() => setDialog(null)}
        />
      )}
    </DashboardContent>
  );
}
