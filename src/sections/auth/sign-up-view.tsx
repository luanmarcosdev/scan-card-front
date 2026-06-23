import type { ChangeEvent } from 'react';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { RouterLink } from 'src/routes/components';

import { useAuth } from 'src/auth';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

// ----------------------------------------------------------------------

export function SignUpView() {
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    document: '',
    phone: '',
    password: '',
    salary: '',
  });

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'document') {
      setForm((prev) => ({ ...prev, document: formatCpf(value) }));
      return;
    }

    if (name === 'phone') {
      setForm((prev) => ({ ...prev, phone: formatPhone(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        document: form.document.replace(/\D/g, ''),
        phone: form.phone.replace(/\D/g, ''),
        password: form.password,
        ...(form.salary ? { salary: Number(form.salary) } : {}),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  }, [form, register]);

  const renderForm = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {error && <Alert severity="error">{error}</Alert>}

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
        name="email"
        label="E-mail"
        type="email"
        value={form.email}
        onChange={handleChange}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField
        fullWidth
        name="document"
        label="CPF"
        value={form.document}
        onChange={handleChange}
        placeholder="000.000.000-00"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField
        fullWidth
        name="phone"
        label="Telefone"
        value={form.phone}
        onChange={handleChange}
        placeholder="(00) 00000-0000"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField
        fullWidth
        name="password"
        label="Senha"
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

      <TextField
        fullWidth
        name="salary"
        label="Salário (opcional)"
        type="number"
        value={form.salary}
        onChange={handleChange}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Button
        fullWidth
        size="large"
        color="inherit"
        variant="contained"
        onClick={handleSubmit}
        disabled={loading || !form.name || !form.email || !form.document || !form.phone || !form.password}
      >
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Criar conta</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Já possui uma conta?
          <Link component={RouterLink} href="/sign-in" variant="subtitle2" sx={{ ml: 0.5 }}>
            Entrar
          </Link>
        </Typography>
      </Box>

      {renderForm}
    </>
  );
}
