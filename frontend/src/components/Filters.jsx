import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

const Filters = ({ filters, onFiltersChange, accounts }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

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

  const handleFilterChange = (field) => (event) => {
    onFiltersChange({ [field]: event.target.value });
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <FilterListIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">
            Filtros
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Mês</InputLabel>
              <Select
                value={filters.month || ''}
                label="Mês"
                onChange={handleFilterChange('month')}
              >
                <MenuItem value="">Todos os meses</MenuItem>
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Ano</InputLabel>
              <Select
                value={filters.year || ''}
                label="Ano"
                onChange={handleFilterChange('year')}
              >
                <MenuItem value="">Todos os anos</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filters.transactionType || ''}
                label="Tipo"
                onChange={handleFilterChange('transactionType')}
              >
                <MenuItem value="">Todos os tipos</MenuItem>
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="saida">Saída</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoria</InputLabel>
              <Select
                value={filters.category || ''}
                label="Categoria"
                onChange={handleFilterChange('category')}
              >
                <MenuItem value="">Todas as categorias</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Conta</InputLabel>
              <Select
                value={filters.accountId || ''}
                label="Conta"
                onChange={handleFilterChange('accountId')}
              >
                <MenuItem value="">Todas as contas</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            Use os filtros acima para refinar a visualização das transações
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Filters; 