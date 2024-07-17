const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to validate contact data
const validateContactData = (req, res, next) => {
  const { name, phone, email } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!phone) {
    return res.status(400).json({ error: 'Phone is required' });
  }
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: 'Phone must be a valid 10-digit number' });
  }
  next();
};

// Create a contact
router.post('/contacts', validateContactData, async (req, res) => {
  const { name, phone, email, address } = req.body;
  try {
    const existingContact = await prisma.contact.findUnique({ where: { phone } });
    if (existingContact) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }

    const contact = await prisma.contact.create({
      data: { name, phone, email, address }
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all contacts
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single contact
router.get('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await prisma.contact.findUnique({ where: { id: Number(id) } });
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a contact
router.put('/contacts/:id', validateContactData, async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address } = req.body;
  try {
    const existingContact = await prisma.contact.findUnique({ where: { id: Number(id) } });
    if (!existingContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contact = await prisma.contact.update({
      where: { id: Number(id) },
      data: { name, phone, email, address }
    });
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a contact
router.delete('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await prisma.contact.findUnique({ where: { id: Number(id) } });
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await prisma.contact.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import contacts endpoint
router.post('/import-contacts', async (req, res) => {
  const newContacts = req.body.contacts;
  console.log(req.body);

  if (!Array.isArray(newContacts)) {
    return res.status(400).send({ error: 'Contacts must be an array' });
  }

  try {
    // Validate and insert contacts
    for (const contact of newContacts) {
      const { name, phone, email, address } = contact;

      if (!name || !phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).send({ error: 'Invalid contact data' });
      }

      // Check if the contact already exists
      const existingContact = await prisma.contact.findUnique({ where: { phone } });
      if (existingContact) {
        continue; // Skip this contact if it already exists
      }

      // Create new contact
      await prisma.contact.create({
        data: { name, phone, email, address }
      });
    }

    const contacts = await prisma.contact.findMany(); // Retrieve all contacts after import
    res.status(201).send({ message: 'Contacts imported successfully', contacts });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
