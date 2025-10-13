const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { isMongoConnected } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all appointments
router.get('/', async (req, res) => {
  try {
    let appointments;
    
    if (isMongoConnected()) {
      appointments = await Appointment.find()
        .populate('leadId', 'name phone email')
        .sort({ appointmentDate: 1 });
    } else {
      appointments = global.inMemoryStore.appointments
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// Create appointment
router.post('/', async (req, res) => {
  try {
    const appointmentData = req.body;

    let appointment;
    if (isMongoConnected()) {
      appointment = await Appointment.create(appointmentData);
    } else {
      appointment = {
        _id: uuidv4(),
        ...appointmentData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.inMemoryStore.appointments.push(appointment);
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment'
    });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    let appointment;
    if (isMongoConnected()) {
      appointment = await Appointment.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
    } else {
      const index = global.inMemoryStore.appointments.findIndex(a => a._id === id);
      if (index !== -1) {
        global.inMemoryStore.appointments[index] = {
          ...global.inMemoryStore.appointments[index],
          ...updateData,
          updatedAt: new Date()
        };
        appointment = global.inMemoryStore.appointments[index];
      }
    }

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment'
    });
  }
});

module.exports = router;