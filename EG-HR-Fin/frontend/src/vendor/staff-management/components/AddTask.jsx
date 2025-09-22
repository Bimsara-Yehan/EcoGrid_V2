import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaUserTie,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaExclamationTriangle,
  FaLeaf,
  FaRecycle,
  FaUsers,
  FaGraduationCap,
  FaStar,
  FaFileAlt,
  FaSync
} from 'react-icons/fa';
import './AddTask.css';

const AddTask = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    location: '',
    points: '',
    requirements: ''
  });

  // Mock data for demonstration
  const [availableUsers] = useState([
    { _id: '1', name: 'John Doe', role: 'Community Member' },
    { _id: '2', name: 'Jane Smith', role: 'Volunteer' },
    { _id: '3', name: 'Mike Johnson', role: 'Staff Member' },
    { _id: '4', name: 'Sarah Wilson', role: 'Community Member' },
    { _id: '5', name: 'David Brown', role: 'Volunteer' }
  ]);

  const taskCategories = [
    {
      value: 'Community & Cleanup',
      label: 'Community & Cleanup',
      icon: <FaUsers />,
      description: 'Community clean-up events, illegal dumping reports, public bin maintenance'
    },
    {
      value: 'Eco-Friendly Practice',
      label: 'Eco-Friendly Practice',
      icon: <FaLeaf />,
      description: 'Reusable bags, composting, plastic reduction, tree planting'
    },
    {
      value: 'Special Collection Drives',
      label: 'Special Collection Drives',
      icon: <FaRecycle />,
      description: 'Clothes collection, scrap metal, hazardous waste collection'
    },
    {
      value: 'Digital/Reporting',
      label: 'Digital/Reporting',
      icon: <FaGraduationCap />,
      description: 'Waste reports, education, awareness posts, training workshops'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'assignedTo', 'dueDate', 'location', 'points'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    // Validate due date
    const selectedDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Due date cannot be in the past');
      setLoading(false);
      return;
    }

    // Validate points
    const points = parseInt(formData.points);
    if (isNaN(points) || points < 1 || points > 1000) {
      setError('Points must be a number between 1 and 1000');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success - navigate back to task list
      navigate('/tasks');
    } catch (err) {
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDescription = (category) => {
    const cat = taskCategories.find(c => c.value === category);
    return cat ? cat.description : '';
  };

  const getCategoryIcon = (category) => {
    const cat = taskCategories.find(c => c.value === category);
    return cat ? cat.icon : <FaFileAlt />;
  };

  return (
    <div className="enhanced-page-container">
      <div className="page-background">
        <div className="floating-elements">
          <div className="floating-element"></div>
          <div className="floating-element"></div>
          <div className="floating-element"></div>
        </div>
      </div>
      
      <div className="enhanced-card">
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <FaFileAlt />
            </div>
            <div className="header-text">
              <h1>Assign New Task</h1>
              <p>Create and assign community tasks to users</p>
            </div>
            <div className="header-actions">
              <button className="back-btn" onClick={() => navigate('/tasks')}>
                <FaArrowLeft />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-section">
            <div className="error-container">
              <FaExclamationTriangle className="error-icon" />
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form className="enhanced-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaFileAlt />
              </div>
              <h3>Task Information</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <FaFileAlt />
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  className="enhanced-input"
                  placeholder="Enter task title..."
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>
                  <FaFileAlt />
                  Description *
                </label>
                <textarea
                  name="description"
                  className="enhanced-textarea"
                  placeholder="Describe the task in detail..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaUsers />
              </div>
              <h3>Assignment & Category</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <FaUserTie />
                  Assign To *
                </label>
                <select
                  name="assignedTo"
                  className="enhanced-select"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select User</option>
                  {availableUsers.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <FaLeaf />
                  Category *
                </label>
                <select
                  name="category"
                  className="enhanced-select"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {taskCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.category && (
                <div className="form-group full-width">
                  <div className="category-info">
                    <div className="category-icon">
                      {getCategoryIcon(formData.category)}
                    </div>
                    <div className="category-details">
                      <h4>{formData.category}</h4>
                      <p>{getCategoryDescription(formData.category)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaCalendarAlt />
              </div>
              <h3>Timeline & Location</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <FaCalendarAlt />
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  className="enhanced-input"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FaMapMarkerAlt />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  className="enhanced-input"
                  placeholder="Enter task location..."
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaStar />
              </div>
              <h3>Priority & Rewards</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <FaStar />
                  Priority Level
                </label>
                <select
                  name="priority"
                  className="enhanced-select"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <FaStar />
                  Points Reward *
                </label>
                <input
                  type="number"
                  name="points"
                  className="enhanced-input"
                  placeholder="Enter points (1-1000)"
                  value={formData.points}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <FaFileAlt />
              </div>
              <h3>Requirements & Instructions</h3>
            </div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>
                  <FaFileAlt />
                  Requirements & Instructions
                </label>
                <textarea
                  name="requirements"
                  className="enhanced-textarea"
                  placeholder="Enter specific requirements, instructions, or guidelines for completing this task..."
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows="4"
                />
                <div className="form-text">
                  Provide clear instructions on what needs to be done, any specific requirements, and how to submit proof of completion.
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="enhanced-btn-secondary"
              onClick={() => navigate('/tasks')}
              disabled={loading}
            >
              <FaTimes />
              Cancel
            </button>
            <button
              type="submit"
              className="enhanced-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSync className="loading-spinner" />
                  Creating Task...
                </>
              ) : (
                <>
                  <FaSave />
                  Assign Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
