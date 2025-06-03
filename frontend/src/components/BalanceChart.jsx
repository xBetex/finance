import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const BalanceChart = ({ accounts }) => {
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [balanceHistory, setBalanceHistory] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && selectedAccounts.length === 0) {
      setSelectedAccounts([accounts[0].id]);
    }
  }, [accounts, selectedAccounts]);

  useEffect(() => {
    if (selectedAccounts.length > 0) {
      loadBalanceHistory();
    }
  }, [selectedAccounts]);

  const loadBalanceHistory = async () => {
    if (selectedAccounts.length === 0) return;
    
    setLoading(true);
    try {
      const historyPromises = selectedAccounts.map(async (accountId) => {
        const response = await fetch(
          `http://localhost:8000/accounts/${accountId}/balance-history?days=30`
        );
        const data = await response.json();
        return { accountId, data };
      });
      
      const results = await Promise.all(historyPromises);
      const historyMap = {};
      
      results.forEach(({ accountId, data }) => {
        historyMap[accountId] = data;
      });
      
      setBalanceHistory(historyMap);
    } catch (error) {
      console.error('Erro ao carregar histórico de saldo:', error);
      setBalanceHistory({});
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === parseInt(accountId));
    return account ? account.name : 'Conta';
  };

  const handleAccountChange = (event) => {
    const value = event.target.value;
    setSelectedAccounts(typeof value === 'string' ? value.split(',') : value);
  };

  const getChartColors = (index) => {
    const colors = ['#1976d2', '#dc004e', '#00796b', '#f57c00', '#7b1fa2', '#388e3c'];
    return colors[index % colors.length];
  };

  const prepareChartData = () => {
    if (Object.keys(balanceHistory).length === 0) return { xAxis: [], series: [] };

    // Get all unique dates and sort them
    const allDates = new Set();
    Object.values(balanceHistory).forEach(history => {
      history.forEach(item => {
        allDates.add(new Date(item.date).toISOString().split('T')[0]);
      });
    });
    
    const sortedDates = Array.from(allDates).sort();
    const xAxisLabels = sortedDates.map(date => 
      new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
    );

    // Create series for each selected account
    const series = selectedAccounts.map((accountId, index) => {
      const accountHistory = balanceHistory[accountId] || [];
      const data = sortedDates.map(date => {
        const entry = accountHistory.find(item => 
          new Date(item.date).toISOString().split('T')[0] === date
        );
        return entry ? entry.balance : null;
      });

      return {
        data,
        label: getAccountName(accountId),
        color: getChartColors(index),
        connectNulls: true,
      };
    });

    return {
      xAxis: xAxisLabels,
      series
    };
  };

  const chartData = prepareChartData();

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Evolução do Saldo - Últimos 30 dias
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 300 }}>
            <InputLabel>Contas</InputLabel>
            <Select
              multiple
              value={selectedAccounts}
              onChange={handleAccountChange}
              input={<OutlinedInput label="Contas" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={getAccountName(value)} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  <Checkbox checked={selectedAccounts.indexOf(account.id) > -1} />
                  <ListItemText primary={account.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : Object.keys(balanceHistory).length === 0 || chartData.series.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <Typography color="text.secondary">
              Nenhum dado de histórico disponível
            </Typography>
          </Box>
        ) : (
          <Box height={300}>
            <LineChart
              width={undefined}
              height={300}
              series={chartData.series}
              xAxis={[
                {
                  scaleType: 'point',
                  data: chartData.xAxis,
                },
              ]}
              margin={{ left: 70, right: 30, top: 30, bottom: 30 }}
              grid={{ vertical: true, horizontal: true }}
            />
          </Box>
        )}

        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            * Gráfico mostra a evolução do saldo baseada nas transações dos últimos 30 dias. 
            Selecione múltiplas contas para comparar.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BalanceChart; 