const { User } = require('../models/index');

// ─── UPDATE PROFILE ───────────────────────────────────────
// PATCH /api/users/me  (protected)
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    await user.update({ name, phone });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile };
