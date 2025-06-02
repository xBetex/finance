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
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

const BalanceChart = ({ accounts }) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  useEffect(() => {
    if (selectedAccount) {
      loadBalanceHistory();
    }
  }, [selectedAccount]);

  const loadBalanceHistory = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/accounts/${selectedAccount}/balance-history?days=30`
      );
      const data = await response.json();
      
      setBalanceHistory(data);
    } catch (error) {
      console.error('Erro ao carregar histórico de saldo:', error);
      setBalanceHistory([]);
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

  const prepareChartData = () => {
    if (!balanceHistory.length) return { xAxis: [], series: [] };

    const dates = balanceHistory.map(item => new Date(item.date).toLocaleDateString('pt-BR'));
    const balances = balanceHistory.map(item => item.balance);

    return {
      xAxis: dates,
      series: balances
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
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Conta</InputLabel>
            <Select
              value={selectedAccount}
              label="Conta"
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : balanceHistory.length === 0 ? (
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
              series={[
                {
                  data: chartData.series,
                  label: getAccountName(selectedAccount),
                  color: '#1976d2',
                },
              ]}
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
            * Gráfico mostra a evolução do saldo baseada nas transações dos últimos 30 dias
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BalanceChart; 