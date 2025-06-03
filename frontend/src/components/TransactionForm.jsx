import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

const TransactionForm = ({ accounts, onTransactionCreated, onClose }) => {
  const [formData, setFormData] = useState({
    date: new Date(),
    description: '',
    transaction_type: '',
    category: '',
    amount: '',
    account_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Entretenimento',
    'Vestuário',
    'Salário',
    'Freelance',
    'Investimentos',
    'Outros'
  ];

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    setError('');
  };

  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.description.trim()) {
      setError('Descrição é obrigatória');
      setLoading(false);
      return;
    }
    if (!formData.transaction_type) {
      setError('Tipo de transação é obrigatório');
      setLoading(false);
      return;
    }
    if (!formData.category) {
      setError('Categoria é obrigatória');
      setLoading(false);
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Valor deve ser maior que zero');
      setLoading(false);
      return;
    }
    if (!formData.account_id) {
      setError('Conta é obrigatória');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/transactions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          date: formData.date.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar transação');
      }

      // Reset form and close
      setFormData({
        date: new Date(),
        description: '',
        transaction_type: '',
        category: '',
        amount: '',
        account_id: '',
      });
      
      onTransactionCreated();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Data"
              value={formData.date}
              onChange={handleDateChange}
              renderInput={(params) => (
                <TextField {...params} fullWidth required />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formData.transaction_type}
                label="Tipo"
                onChange={handleChange('transaction_type')}
              >
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="saida">Saída</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição"
              value={formData.description}
              onChange={handleChange('description')}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={formData.category}
                label="Categoria"
                onChange={handleChange('category')}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Conta</InputLabel>
              <Select
                value={formData.account_id}
                label="Conta"
                onChange={handleChange('account_id')}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Valor"
              type="number"
              value={formData.amount}
              onChange={handleChange('amount')}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              inputProps={{
                step: "0.01",
                min: "0.01"
              }}
              required
            />
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default TransactionForm; 