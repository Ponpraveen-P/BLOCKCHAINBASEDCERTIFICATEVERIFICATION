import bcrypt from 'bcryptjs';
import { Student, User, Certificate } from '../utils/db.js';

export const createStudent = async (req, res) => {
  const { name, email, enrollmentNumber, department, college, course } = req.body;

  try {
    if (!name || !email || !enrollmentNumber || !department || !college || !course) {
      return res.status(400).json({ message: 'Please provide all required student fields' });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ enrollmentNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this enrollment number already exists' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create the student profile
    const student = await Student.create({
      name,
      email,
      enrollmentNumber,
      department,
      college,
      course,
      certificates: []
    });

    // Create user login account (default password is the enrollment number)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(enrollmentNumber, salt);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      enrollmentNumber
    });

    res.status(201).json(student);
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudents = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  try {
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination using custom thenable/array sorting
    const total = await Student.countDocuments(query);
    const rawStudents = await Student.find(query);
    
    // Sort, skip, and limit manually (works for both mongo and JSON chainable)
    let students = rawStudents;
    if (typeof rawStudents.sort === 'function') {
      const chained = await Student.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      students = chained;
    } else {
      // Direct array manipulation if mongoose fell back in some custom way
      students = rawStudents.slice((page - 1) * limit, page * limit);
    }

    res.json({
      students,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentById = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Manually load certificates (ensuring local database engines compatibility)
    const certificates = await Certificate.find({ studentId: student._id });

    res.json({
      student,
      certificates
    });
  } catch (err) {
    console.error('Get student by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, department, college, course } = req.body;

  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update user login credentials if email or name changes
    if (email && email !== student.email) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'Email already in use by another user' });
      }
      await User.findByIdAndUpdate(
        student._id, // User and Student may share schema attributes or matching key
        { email }
      );
      // Fallback matching by email if ids are different
      const userByEnrollment = await User.findOne({ enrollmentNumber: student.enrollmentNumber });
      if (userByEnrollment) {
        await User.findByIdAndUpdate(userByEnrollment._id, { email, name: name || student.name });
      }
    } else if (name && name !== student.name) {
      const userByEnrollment = await User.findOne({ enrollmentNumber: student.enrollmentNumber });
      if (userByEnrollment) {
        await User.findByIdAndUpdate(userByEnrollment._id, { name });
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { name, email, department, college, course },
      { new: true }
    );

    res.json(updatedStudent);
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete student login user account
    await User.deleteMany({ enrollmentNumber: student.enrollmentNumber });

    // Delete certificates linked to the student
    await Certificate.deleteMany({ studentId: student._id });

    // Delete student profile
    await Student.findByIdAndDelete(id);

    res.json({ message: 'Student, their login account, and certificates deleted' });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
