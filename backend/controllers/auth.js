import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Student } from '../utils/db.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'supersecretblockchainkey12345!',
      { expiresIn: '24h' }
    );

    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await Student.findOne({ enrollmentNumber: user.enrollmentNumber });
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollmentNumber: user.enrollmentNumber || null,
        studentId: studentProfile ? studentProfile._id : null
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let studentProfile = null;

    if (user.role === 'student') {
      studentProfile = await Student.findOne({ enrollmentNumber: user.enrollmentNumber });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      enrollmentNumber: user.enrollmentNumber || null,
      studentId: studentProfile ? studentProfile._id : null
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
