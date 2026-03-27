const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

// helper — generates a JWT token with user id and role inside
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },                          // payload — data inside the token
    process.env.JWT_SECRET,                // secret key to sign it
    { expiresIn: process.env.JWT_EXPIRES_IN } // token expires in 7d
  );
};

// ─── REGISTER ────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // 1. check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400);
      throw new Error('Email already registered');
    }

    // 2. hash the password — never store plain text
    // 12 = salt rounds — how many times to scramble (higher = slower but safer)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. create user in DB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    // 4. generate token
    const token = generateToken(user.id, user.role);

    // 5. send response — never send password back
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── LOGIN ───────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. find user by email — include password this time to compare
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // 2. compare entered password with hashed one in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      // same message intentionally — don't tell attacker which one was wrong
      throw new Error('Invalid email or password');
    }

    // 3. generate token
    const token = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET LOGGED IN USER ───────────────────────────────────
// GET /api/auth/me  (protected route)
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE PASSWORD ──────────────────────────────────────
// PATCH /api/auth/update-password (protected)
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // fetch user WITH password from DB
    const user = await User.findByPk(req.user.id);

    // verify current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }

    // hash new password and save
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updatePassword };