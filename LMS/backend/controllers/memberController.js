const Member = require('../models/Member');

/**
 * Member Controller
 * Handles all member-related business logic
 */

// GET /api/members - Retrieve all members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving members',
      error: error.message
    });
  }
};

// GET /api/members/:id - Retrieve a specific member
exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving member',
      error: error.message
    });
  }
};

// POST /api/members - Create a new member
exports.createMember = async (req, res) => {
  try {
    const member = await Member.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: member
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating member',
      error: error.message
    });
  }
};

// PUT /api/members/:id - Update a member
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      data: member
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating member',
      error: error.message
    });
  }
};

// DELETE /api/members/:id - Delete a member
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting member',
      error: error.message
    });
  }
};
