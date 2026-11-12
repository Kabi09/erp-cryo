const Notification = require('../models/Notification');

// @desc Get notifications for logged in user
// @route GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?._id;

    const notifications = await Notification.find({
      $or: [
        { recipient: userId },
        { targetRoles: userRole },
        { targetRoles: { $size: 0 } }
      ]
    }).sort({ createdAt: -1 }).limit(30);

    const unreadCount = await Notification.countDocuments({
      $or: [
        { recipient: userId },
        { targetRoles: userRole }
      ],
      isRead: false
    });

    res.json({ success: true, count: notifications.length, unreadCount, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Mark notification as read
// @route PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Mark all as read
// @route PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?._id;

    await Notification.updateMany(
      {
        $or: [
          { recipient: userId },
          { targetRoles: userRole }
        ],
        isRead: false
      },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
