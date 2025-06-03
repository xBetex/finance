import React, { useState } from 'react';
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
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TransactionList = ({ transactions, accounts, loading, onTransactionUpdate, onTransactionDelete }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading_action, setLoadingAction] = useState(false);
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

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const handleContextMenu = (event, transaction) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
    setSelectedTransaction(transaction);
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleEdit = () => {
    setEditForm({
      date: formatDateForInput(selectedTransaction.date),
      description: selectedTransaction.description,
      transaction_type: selectedTransaction.transaction_type,
      category: selectedTransaction.category,
      amount: selectedTransaction.amount,
      account_id: selectedTransaction.account_id,
    });
    setEditDialog(true);
    handleCloseContextMenu();
  };

  const handleDelete = () => {
    setDeleteDialog(true);
    handleCloseContextMenu();
  };

  const handleEditSubmit = async () => {
    setLoadingAction(true);
    setError('');
    try {
      const updateData = {
        ...editForm,
        date: new Date(editForm.date).toISOString(),
      };
      await onTransactionUpdate(selectedTransaction.id, updateData);
      setEditDialog(false);
      setSelectedTransaction(null);
    } catch (err) {
      setError('Erro ao atualizar transação');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoadingAction(true);
    setError('');
    try {
      await onTransactionDelete(selectedTransaction.id);
      setDeleteDialog(false);
      setSelectedTransaction(null);
    } catch (err) {
      setError('Erro ao excluir transação');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
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
    <>
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
                    <ListItem
                      onContextMenu={(e) => handleContextMenu(e, transaction)}
                      sx={{ 
                        cursor: 'context-menu',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
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
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography
                                variant="h6"
                                color={transaction.transaction_type === 'entrada' ? 'success.main' : 'error.main'}
                                fontWeight="bold"
                              >
                                {transaction.transaction_type === 'entrada' ? '+' : '-'}
                                {formatCurrency(Math.abs(transaction.amount))}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={(e) => handleContextMenu(e, transaction)}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Box>
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

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Excluir
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Transação</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Data e Hora"
                type="datetime-local"
                value={editForm.date || ''}
                onChange={(e) => handleEditFormChange('date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={editForm.description || ''}
                onChange={(e) => handleEditFormChange('description', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={editForm.transaction_type || ''}
                  label="Tipo"
                  onChange={(e) => handleEditFormChange('transaction_type', e.target.value)}
                >
                  <MenuItem value="entrada">Entrada</MenuItem>
                  <MenuItem value="saida">Saída</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valor"
                type="number"
                value={editForm.amount || ''}
                onChange={(e) => handleEditFormChange('amount', parseFloat(e.target.value))}
                InputProps={{
                  startAdornment: 'R$ ',
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={editForm.category || ''}
                  label="Categoria"
                  onChange={(e) => handleEditFormChange('category', e.target.value)}
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
              <FormControl fullWidth>
                <InputLabel>Conta</InputLabel>
                <Select
                  value={editForm.account_id || ''}
                  label="Conta"
                  onChange={(e) => handleEditFormChange('account_id', e.target.value)}
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            disabled={loading_action}
          >
            {loading_action ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Typography>
            Tem certeza que deseja excluir a transação "{selectedTransaction?.description}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            disabled={loading_action}
          >
            {loading_action ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TransactionList;