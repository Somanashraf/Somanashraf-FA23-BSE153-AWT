import Message from '../models/Message.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { successResponse, ApiError, paginatedResponse } from '../utils/apiResponse.js';

const getConversationId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

// @POST /api/messages
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, type = 'text' } = req.body;

    const receiver = await User.findById(receiverId);
    if (!receiver) throw new ApiError(404, 'Recipient not found');

    // Only allow patient-doctor messaging
    const validPairs = [
      ['patient', 'doctor'],
      ['doctor', 'patient'],
      ['doctor', 'assistant'],
      ['assistant', 'doctor'],
    ];
    const pair = [req.user.role, receiver.role].sort().join('-');
    const isValid = validPairs.some((p) => p.sort().join('-') === pair);
    // Allow admin to message anyone
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    if (!isValid && !isAdmin) {
      throw new ApiError(403, 'Messaging not allowed between these roles');
    }

    const conversationId = getConversationId(req.user._id, receiverId);

    const messageData = {
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiverId,
      content,
      type,
    };

    if (req.file) {
      messageData.attachment = {
        url: req.file.path,
        publicId: req.file.filename,
        name: req.file.originalname,
      };
    }

    const message = await Message.create(messageData);

    // Notify receiver
    await Notification.create({
      recipient: receiverId,
      title: `New message from ${req.user.firstName}`,
      message: content.substring(0, 100),
      type: 'message',
      link: `/messages/${req.user._id}`,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'firstName lastName profilePicture role')
      .populate('receiver', 'firstName lastName profilePicture role');

    // Emit via socket if available
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId.toString()).emit('new_message', populated);
    }

    return successResponse(res, 201, 'Message sent', { message: populated });
  } catch (error) {
    next(error);
  }
};

// @GET /api/messages/:userId — get conversation
export const getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversationId = getConversationId(req.user._id, userId);
    const skip = (Number(page) - 1) * Number(limit);

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId, isDeleted: false })
        .populate('sender', 'firstName lastName profilePicture role')
        .populate('receiver', 'firstName lastName profilePicture role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Message.countDocuments({ conversation: conversationId, isDeleted: false }),
    ]);

    // Mark as read
    await Message.updateMany(
      { conversation: conversationId, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return paginatedResponse(res, 200, 'Messages retrieved', messages.reverse(), {
      page: Number(page), limit: Number(limit), total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/messages/conversations — list all conversations
export const getConversations = async (req, res, next) => {
  try {
    // Get all unique conversations for this user
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { receiver: req.user._id }],
          isDeleted: false,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversation',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$isRead', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    // Populate the other user
    const conversations = await Promise.all(
      messages.map(async (conv) => {
        const otherUserId = conv.lastMessage.sender.toString() === req.user._id.toString()
          ? conv.lastMessage.receiver
          : conv.lastMessage.sender;

        const otherUser = await User.findById(otherUserId).select(
          'firstName lastName profilePicture role'
        );

        return {
          conversationId: conv._id,
          user: otherUser,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        };
      })
    );

    return successResponse(res, 200, 'Conversations retrieved', { conversations });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/messages/:messageId/read
export const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) throw new ApiError(404, 'Message not found');
    if (message.receiver.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Unauthorized');
    }
    message.isRead = true;
    message.readAt = new Date();
    await message.save();
    return successResponse(res, 200, 'Message marked as read');
  } catch (error) {
    next(error);
  }
};
