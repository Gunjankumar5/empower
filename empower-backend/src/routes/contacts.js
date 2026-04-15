const express = require('express');
const User = require('../models/user');
const auth = require('../middlewares/auth');

const router = express.Router();

const sendSuccess = (res, data, status = 200) => res.status(status).json({ success: true, data });
const sendError = (res, error, status = 400) => res.status(status).json({ success: false, error });

const contactShape = (contact) => ({
  id: contact._id,
  name: contact.name,
  phone: contact.phone,
  email: contact.email || '',
  relation: contact.relation || '',
});

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('emergencyContacts');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user.emergencyContacts.map(contactShape));
  } catch (error) {
    console.error('Get contacts error:', error);
    return sendError(res, 'Failed to load contacts', 500);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, email = '', relation = '' } = req.body;
    if (!name || !phone) {
      return sendError(res, 'name and phone are required', 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.emergencyContacts.push({ name, phone, email, relation });
    await user.save();

    const contact = user.emergencyContacts[user.emergencyContacts.length - 1];
    return sendSuccess(res, contactShape(contact), 201);
  } catch (error) {
    console.error('Add contact error:', error);
    return sendError(res, 'Failed to add contact', 500);
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, relation } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const contact = user.emergencyContacts.id(id);
    if (!contact) {
      return sendError(res, 'Contact not found', 404);
    }

    if (name !== undefined) contact.name = name;
    if (phone !== undefined) contact.phone = phone;
    if (email !== undefined) contact.email = email;
    if (relation !== undefined) contact.relation = relation;

    await user.save();
    return sendSuccess(res, contactShape(contact));
  } catch (error) {
    console.error('Update contact error:', error);
    return sendError(res, 'Failed to update contact', 500);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const contact = user.emergencyContacts.id(id);
    if (!contact) {
      return sendError(res, 'Contact not found', 404);
    }

    contact.deleteOne();
    await user.save();
    return sendSuccess(res, { id });
  } catch (error) {
    console.error('Delete contact error:', error);
    return sendError(res, 'Failed to delete contact', 500);
  }
});

module.exports = router;