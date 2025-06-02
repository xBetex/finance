import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

const AccountIndicator = ({ account }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getBalanceColor = (balance) => {
    if (balance > 1000) return 'success.main';
    if (balance > 0) return 'warning.main';
    return 'error.main';
  };

  const getBalanceIcon = (balance) => {
    if (balance > 0) {
      return <TrendingUpIcon color="success" />;
    } else if (balance < 0) {
      return <TrendingDownIcon color="error" />;
    }
    return <AccountBalanceIcon color="action" />;
  };

  const getProgressValue = (balance) => {
    // Normalize balance to a 0-100 scale for visual purposes
    const maxValue = 5000; // Arbitrary max for visualization
    const normalizedValue = Math.max(0, Math.min(100, (balance / maxValue) * 100));
    return normalizedValue;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="div" color="text.secondary">
            {account.name}
          </Typography>
          {getBalanceIcon(account.balance)}
        </Box>
        
        <Typography
          variant="h4"
          component="div"
          color={getBalanceColor(account.balance)}
          fontWeight="bold"
          mb={2}
        >
          {formatCurrency(account.balance)}
        </Typography>

        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption" color="text.secondary">
              Status da Conta
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {account.balance > 0 ? 'Positivo' : account.balance < 0 ? 'Negativo' : 'Zerado'}
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={getProgressValue(account.balance)}
            color={account.balance > 1000 ? 'success' : account.balance > 0 ? 'warning' : 'error'}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
            }}
          />
        </Box>

        <Box mt={2}>
          <Typography variant="caption" color="text.secondary" display="block">
            ID da Conta: {account.id}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AccountIndicator; 