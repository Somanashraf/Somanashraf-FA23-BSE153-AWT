import Notification from '../models/Notification.js';
import { successResponse, ApiError, paginatedResponse } from '../utils/apiResponse.js';

// @GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') query.isRead = false;

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    return paginatedResponse(
      res, 200, 'Notifications retrieved',
      { notifications, unreadCount },
      { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    );
  } catch (error) {
    next(error);
  }
};

// @PUT /api/notifications/:id/read
export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });
    if (!notification) throw new ApiError(404, 'Notification not found');

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return successResponse(res, 200, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

// @PUT /api/notifications/read-all
export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return successResponse(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

// @DELETE /api/notifications/:id
export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });
    return successResponse(res, 200, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};
