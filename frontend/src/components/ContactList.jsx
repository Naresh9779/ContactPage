import React, { useState, useEffect } from 'react';
import {
  Button, Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Tooltip, 
  TableSortLabel
} from '@mui/material';
import {
  Add as AddIcon, ImportContacts as ImportContactsIcon, MoreVert as MoreVertIcon,
  Delete as DeleteIcon, Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';
import '../assets/contactList.css'; // Import CSS file for additional custom styles

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [formValues, setFormValues] = useState({ name: '', phone: '', email: '',createdate:'', subcriptionStatus: '', address: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/contacts');
        setContacts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const handleOpenForm = (contact = null) => {
    if (contact) {
      setFormValues(contact);
      setEditingContact(contact);
    } else {
      setFormValues({ name: '', phone: '',createdate:'', email: '', subcriptionStatus: '', address: '' });
      setEditingContact(null);
    }
    setOpenForm(true);
    setServerError('');
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setErrors({});
    setServerError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formValues.name) {
      formErrors.name = 'Name is required';
    }
    if (!formValues.phone) {
      formErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formValues.phone)) {
      formErrors.phone = 'Phone must be a valid 10-digit number';
    }
    if (formValues.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      formErrors.email = 'Email must be a valid email address';
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      if (editingContact) {
        // Update contact
        await axios.put(`http://localhost:3000/api/contacts/${editingContact.id}`, formValues);
        setContacts(contacts.map(contact => (contact.id === editingContact.id ? formValues : contact)));
      } else {
        // Add new contact
        const response = await axios.post('http://localhost:3000/api/contacts', formValues);
        setContacts([...contacts, response.data]);
      }
      handleCloseForm();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setServerError(error.response.data.error);
      } else {
        console.error('Error submitting form:', error);
      }
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/contacts/${id}`);
      setContacts(contacts.filter(contact => contact.id !== id));
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedContacts = contacts.sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredContacts = sortedContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const contacts = JSON.parse(event.target.result);
          console.log(contacts);
          const response = await axios.post('http://localhost:3000/api/import-contacts', {contacts});
          console.log(response.data.contacts);
          setContacts([ ...response.data.contacts]);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Contacts
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6} style={{ textAlign: 'right' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            style={{ marginRight: '10px' }}
          >
            Create Contact
          </Button>
          <input
            accept=".json"
            id="contained-button-file"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <label htmlFor="contained-button-file">
            <Button
              variant="contained"
              style={{ backgroundColor: 'blue', color: 'white' }}
              startIcon={<ImportContactsIcon />}
              component="span"
            >
              Import Contacts
            </Button>
          </label>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            variant="outlined"
            placeholder="Search contacts..."
            InputProps={{
              startAdornment: <SearchIcon />,
            }}
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth
          />
        </Grid>
      </Grid>
      <Grid container spacing={2} style={{ marginTop: '20px' }}>
        <Grid item xs={true}>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'name'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('name')}
                      >
                        FirstName
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>LastName</TableCell>
                    <TableCell>Phone number</TableCell>
                    <TableCell>Email ID</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'createDate'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('createDate')}
                      >
                        Created
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>{contact.name.split(' ')[0]}</TableCell>
                      <TableCell>{contact.name.split(' ')[1]}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{(contact.createdate).split('T')[0]}</TableCell>
                      <TableCell>{contact.address}</TableCell>
                      <TableCell style={{ color: contact.subcriptionStatus === 'Subscribed' ? 'green' : 'red' }}>
                        {contact.subcriptionStatus}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="More actions">
                          <IconButton onClick={() => handleOpenForm(contact)}>
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete contact">
                          <IconButton onClick={() => handleDeleteContact(contact.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>
      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle>{editingContact ? 'Update Contact' : 'Add Contact'}</DialogTitle>
        <DialogContent>
          {serverError && <Typography color="error">{serverError}</Typography>}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={formValues.name}
            onChange={handleFormChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone"
            type="tel"
            fullWidth
            value={formValues.phone}
            onChange={handleFormChange}
            error={!!errors.phone}
            helperText={errors.phone}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formValues.email}
            onChange={handleFormChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            margin="dense"
            name="address"
            label="Address"
            type="text"
            fullWidth
            value={formValues.address}
            onChange={handleFormChange}
            error={!!errors.address}
            helperText={errors.address}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="primary">
            Cancel
          </Button>
          <Button onClick={handleFormSubmit} color="primary">
            {editingContact ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContactsPage;
