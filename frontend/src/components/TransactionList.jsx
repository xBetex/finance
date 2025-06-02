import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TransactionList = ({ transactions, accounts, loading }) => {
  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Conta desconhecida';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const groupTransactionsByMonth = (transactions) => {
    const grouped = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = format(date, 'MMMM yyyy', { locale: ptBR });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(transaction);
    });

    // Sort transactions within each month by date (newest first)
    Object.keys(grouped).forEach(month => {
      grouped[month].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    return grouped;
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <CalendarIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhuma transação encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use o botão + para adicionar uma nova transação
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const groupedTransactions = groupTransactionsByMonth(transactions);

  return (
    <Card>
      <CardContent>
        {Object.entries(groupedTransactions).map(([month, monthTransactions]) => (
          <Box key={month} mb={3}>
            <Typography variant="h6" color="primary" gutterBottom>
              {month.charAt(0).toUpperCase() + month.slice(1)}
            </Typography>
            
            <List dense>
              {monthTransactions.map((transaction, index) => (
                <React.Fragment key={transaction.id}>
                  <ListItem>
                    <ListItemIcon>
                      {transaction.transaction_type === 'entrada' ? (
                        <TrendingUpIcon color="success" />
                      ) : (
                        <TrendingDownIcon color="error" />
                      )}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1">
                            {transaction.description}
                          </Typography>
                          <Typography
                            variant="h6"
                            color={transaction.transaction_type === 'entrada' ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            {transaction.transaction_type === 'entrada' ? '+' : '-'}
                            {formatCurrency(Math.abs(transaction.amount))}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Box display="flex" gap={1} alignItems="center">
                            <Chip 
                              label={transaction.category} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={getAccountName(transaction.account_id)} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(transaction.date)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  
                  {index < monthTransactions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default TransactionList;