import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaPlus,
  FaSearch,
  FaTimes,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaUserTie,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaLeaf,
  FaRecycle,
  FaUsers,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaCalendarCheck,
  FaCalendarTimes,
  FaHourglassHalf,
  FaSync
} from 'react-icons/fa';
import './TaskList.css';

const TaskList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockTasks = [
      {
        _id: '1',
        taskId: 'TASK2025001',
        title: 'Community Clean-up Event',
        description: 'Participate in a community clean-up event at Central Park',
        category: 'Community & Cleanup',
        assignedTo: 'John Doe',
        assignedBy: 'Admin',
        status: 'assigned',
        priority: 'high',
        dueDate: '2025-02-15',
        assignedDate: '2025-01-20',
        location: 'Central Park',
        points: 50,
        requirements: 'Bring gloves and safety equipment'
      },
      {
        _id: '2',
        taskId: 'TASK2025002',
        title: 'Reusable Bags Campaign',
        description: 'Bring your own reusable bags during shopping and upload proof',
        category: 'Eco-Friendly Practice',
        assignedTo: 'Jane Smith',
        assignedBy: 'Admin',
        status: 'in-progress',
        priority: 'medium',
        dueDate: '2025-02-10',
        assignedDate: '2025-01-18',
        location: 'Shopping Centers',
        points: 30,
        requirements: 'Upload photos of reusable bags usage'
      },
      {
        _id: '3',
        taskId: 'TASK2025003',
        title: 'Old Clothes Collection',
        description: 'Collect old clothes for recycling/donation drives',
        category: 'Special Collection Drives',
        assignedTo: 'Mike Johnson',
        assignedBy: 'Admin',
        status: 'completed',
        priority: 'low',
        dueDate: '2025-01-25',
        assignedDate: '2025-01-15',
        location: 'Community Center',
        points: 40,
        requirements: 'Minimum 5kg of clothes required'
      },
      {
        _id: '4',
        taskId: 'TASK2025004',
        title: 'Waste Segregation Education',
        description: 'Educate 2+ neighbors on waste segregation and upload proof',
        category: 'Digital/Reporting',
        assignedTo: 'Sarah Wilson',
        assignedBy: 'Admin',
        status: 'assigned',
        priority: 'high',
        dueDate: '2025-02-20',
        assignedDate: '2025-01-22',
        location: 'Residential Area',
        points: 60,
        requirements: 'Document education sessions with photos'
      },
      {
        _id: '5',
        taskId: 'TASK2025005',
        title: 'Tree Planting Initiative',
        description: 'Plant a tree and maintain greenery in assigned zone',
        category: 'Eco-Friendly Practice',
        assignedTo: 'David Brown',
        assignedBy: 'Admin',
        status: 'in-progress',
        priority: 'medium',
        dueDate: '2025-03-01',
        assignedDate: '2025-01-25',
        location: 'Green Zone A',
        points: 70,
        requirements: 'Monthly maintenance reports required'
      }
    ];

    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned':
        return <FaClock />;
      case 'in-progress':
        return <FaHourglassHalf />;
      case 'completed':
        return <FaCheckCircle />;
      case 'overdue':
        return <FaTimesCircle />;
      default:
        return <FaExclamationTriangle />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'status-assigned';
      case 'in-progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'overdue':
        return 'status-overdue';
      default:
        return 'status-assigned';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Community & Cleanup':
        return <FaUsers />;
      case 'Eco-Friendly Practice':
        return <FaLeaf />;
      case 'Special Collection Drives':
        return <FaRecycle />;
      case 'Digital/Reporting':
        return <FaGraduationCap />;
      default:
        return <FaMapMarkerAlt />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.taskId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const clearSearch = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  if (loading) {
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
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
          <div className="error-container">
            <FaExclamationTriangle className="error-icon" />
            <h3>Error Loading Tasks</h3>
            <p>{error}</p>
            <button className="enhanced-btn-primary" onClick={() => window.location.reload()}>
              <FaSync /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <FaMapMarkerAlt />
            </div>
            <div className="header-text">
              <h1>Task Management</h1>
              <p>Assign and track community tasks</p>
            </div>
            <div className="header-actions">
              <button className="back-btn" onClick={() => navigate('/')}>
                <FaArrowLeft />
              </button>
              <button className="new-task-btn" onClick={() => navigate('/tasks/add')}>
                <FaPlus />
                New Task
              </button>
            </div>
          </div>
        </div>

        <div className="enhanced-search-section">
          <div className="search-filters-container">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="enhanced-search-input"
                placeholder="Search tasks, users, or task ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={clearSearch}>
                  <FaTimes />
                </button>
              )}
            </div>
            
            <div className="filter-container">
              <FaFilter className="filter-icon" />
              <select
                className="enhanced-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="filter-container">
              <FaFilter className="filter-icon" />
              <select
                className="enhanced-filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Community & Cleanup">Community & Cleanup</option>
                <option value="Eco-Friendly Practice">Eco-Friendly Practice</option>
                <option value="Special Collection Drives">Special Collection Drives</option>
                <option value="Digital/Reporting">Digital/Reporting</option>
              </select>
            </div>
          </div>

          {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ? (
            <div className="search-results-info">
              <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
              <button className="clear-filters-btn" onClick={clearSearch}>
                Clear Filters
              </button>
            </div>
          ) : null}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaMapMarkerAlt />
            </div>
            <h3>No Tasks Found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'No tasks have been assigned yet'}
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <button className="enhanced-btn-primary" onClick={() => navigate('/tasks/add')}>
                <FaPlus /> Create First Task
              </button>
            )}
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map((task) => (
              <div key={task._id} className="task-card">
                <div className="card-background"></div>
                
                <div className="task-header">
                  <div className="task-id">
                    <FaCalendarCheck />
                    <span>{task.taskId}</span>
                  </div>
                  <div className={`status-badge ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span>{task.status.replace('-', ' ')}</span>
                  </div>
                </div>

                <div className="task-content">
                  <div className="task-title">{task.title}</div>
                  <div className="task-description">{task.description}</div>
                  
                  <div className="task-category">
                    <div className="category-icon">
                      {getCategoryIcon(task.category)}
                    </div>
                    <span>{task.category}</span>
                  </div>

                  <div className="task-details">
                    <div className="detail-item">
                      <FaUserTie />
                      <span><strong>Assigned to:</strong> {task.assignedTo}</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <FaMapMarkerAlt />
                      <span><strong>Location:</strong> {task.location}</span>
                    </div>
                    <div className="detail-item">
                      <FaClock />
                      <span><strong>Points:</strong> {task.points}</span>
                    </div>
                  </div>

                  <div className={`priority-badge ${getPriorityColor(task.priority)}`}>
                    {task.priority} Priority
                  </div>
                </div>

                <div className="task-actions">
                  <button className="action-btn view-btn" onClick={() => navigate(`/tasks/${task._id}`)}>
                    <FaEye />
                    <span>View</span>
                  </button>
                  <button className="action-btn edit-btn" onClick={() => navigate(`/tasks/${task._id}/edit`)}>
                    <FaEdit />
                    <span>Edit</span>
                  </button>
                  <button className="action-btn delete-btn">
                    <FaTrash />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
