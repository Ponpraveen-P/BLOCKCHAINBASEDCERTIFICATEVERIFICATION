import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { studentService } from '../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // student object or null
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    enrollmentNumber: '',
    department: '',
    college: '',
    course: ''
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAll(page, 10, search);
      setStudents(data.students);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      enrollmentNumber: '',
      department: '',
      college: '',
      course: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      enrollmentNumber: student.enrollmentNumber,
      department: student.department,
      college: student.college,
      course: student.course
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Warning: Deleting this student will permanently erase their login user account and all certificates issued on the ledger! Proceed?')) {
      return;
    }

    try {
      await studentService.delete(id);
      toast.success('Student and certificates successfully deleted.');
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete student.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        // Update Student
        await studentService.update(editingStudent._id, formData);
        toast.success('Student profile updated successfully.');
      } else {
        // Create Student
        await studentService.create(formData);
        toast.success(`Student created! Credentials sent to: ${formData.email}`);
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save student profile.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Student Management</h1>
          <p className="text-xs text-cyber-muted mt-1">Enroll students and provision authentication profiles</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center px-4 py-2.5 bg-cyber-cyan text-cyber-bg font-semibold rounded-lg text-xs hover:bg-opacity-90 transition-all shadow-glow-cyan"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Enroll Student
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset page to 1 on search
          }}
          placeholder="Search by student name or enrollment number..."
          className="w-full bg-cyber-panel border border-cyber-border rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyber-cyan transition-all"
        />
      </div>

      {/* Student List Table */}
      <div className="glass-panel overflow-hidden border border-cyber-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cyber-border text-cyber-muted uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Enrollment Number</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Degree Track</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border divide-opacity-35">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-cyber-cyan animate-pulse">
                    Querying student registry...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-cyber-muted">
                    No student accounts found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-800 hover:bg-opacity-25 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{student.name}</td>
                    <td className="px-6 py-4 font-mono text-cyber-cyan font-semibold">{student.enrollmentNumber}</td>
                    <td className="px-6 py-4 text-gray-300">{student.email}</td>
                    <td className="px-6 py-4 text-cyber-muted">{student.department}</td>
                    <td className="px-6 py-4 text-gray-300">{student.course}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="p-1.5 bg-cyber-panel border border-cyber-border rounded hover:border-cyber-cyan text-gray-400 hover:text-white transition-colors"
                        title="Edit profile"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="p-1.5 bg-cyber-panel border border-cyber-border rounded hover:border-cyber-red text-gray-400 hover:text-cyber-red transition-colors"
                        title="Delete student"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-cyber-border bg-black bg-opacity-15 flex justify-between items-center text-xs">
            <span className="text-cyber-muted">
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-cyber-border rounded hover:bg-gray-800 disabled:opacity-50 text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-cyber-border rounded hover:bg-gray-800 disabled:opacity-50 text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Form Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" 
              onClick={() => setModalOpen(false)} 
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-cyber-panel border border-cyber-border rounded-xl p-6 max-w-md w-full z-50 shadow-glow-cyan"
            >
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-cyber-muted hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-display font-bold text-white text-lg mb-6 flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-cyber-cyan animate-pulse" />
                {editingStudent ? 'Edit Student Profile' : 'Enroll New Student'}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-cyber-muted uppercase tracking-wider mb-1.5">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full bg-black bg-opacity-40 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-cyan transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-cyber-muted uppercase tracking-wider mb-1.5">
                      Enrollment Number
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingStudent}
                      value={formData.enrollmentNumber}
                      onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                      placeholder="e.g. CS-2023-081"
                      className="w-full bg-black bg-opacity-40 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-cyan disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-cyber-muted uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. aarav@college.edu"
                      className="w-full bg-black bg-opacity-40 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-cyan transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-cyber-muted uppercase tracking-wider mb-1.5">
                    Department Branch
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full bg-black bg-opacity-40 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-cyan transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-cyber-muted uppercase tracking-wider mb-1.5">
                    Degree Course Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full bg-black bg-opacity-40 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-cyan transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-cyber-muted uppercase tracking-wider mb-1.5">
                    Affiliated College/University
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="e.g. Indian Institute of Technology, Delhi"
                    className="w-full bg-black bg-opacity-40 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-cyan transition-all"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 border border-cyber-border rounded-lg text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-cyber-cyan text-cyber-bg font-bold rounded-lg text-xs hover:opacity-90 transition-all shadow-glow-cyan"
                  >
                    {editingStudent ? 'Save Updates' : 'Enroll Student'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentManagement;
