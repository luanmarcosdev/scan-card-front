import type { ChangeEvent } from 'react';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useAuth } from 'src/auth';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AccountView() {
  const { user, updateProfile } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    salary: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        salary: user.salary != null ? String(user.salary) : '',
        password: '',
      });
    }
  }, [user]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await updateProfile({
        name: form.name,
        salary: form.salary !== '' ? Number(form.salary) : null,
        ...(form.password ? { password: form.password } : {}),
      });
      setSuccess(true);
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }, [form, updateProfile]);

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Minha Conta
      </Typography>

      <Card sx={{ p: 3, maxWidth: 480 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Dados atualizados com sucesso!</Alert>}

          <TextField
            fullWidth
            name="name"
            label="Nome completo"
            value={form.name}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            fullWidth
            name="salary"
            label="Salário (opcional)"
            type="number"
            value={form.salary}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            fullWidth
            name="password"
            label="Nova senha (opcional)"
            value={form.password}
            onChange={handleChange}
            type={showPassword ? 'text' : 'password'}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            fullWidth
            size="large"
            color="inherit"
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !form.name}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </Box>
      </Card>
    </DashboardContent>
  );
}
