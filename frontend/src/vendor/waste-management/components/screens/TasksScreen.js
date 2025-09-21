import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  CheckSquare, 
  Square, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Plus,
  Filter,
  Search,
  Calendar,
  User,
  Star,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TasksScreen = () => {
  const { user } = useAuth();
  const { getString } = useLanguage();
  const { isDarkMode } = useTheme();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckSquare className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      case 'high':
        return <AlertCircle className="h-3 w-3 text-orange-600" />;
      case 'medium':
        return <AlertCircle className="h-3 w-3 text-yellow-600" />;
      case 'low':
        return <AlertCircle className="h-3 w-3 text-green-600" />;
      default:
        return <AlertCircle className="h-3 w-3 text-gray-600" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleTaskComplete = async () => {
    if (!completionNotes.trim()) {
      toast.error('Please provide completion notes');
      return;
    }

    try {
      await axios.put(`/api/tasks/${selectedTask._id}/complete`, {
        completionNotes
      });
      
      toast.success('Task marked as completed!');
      setShowCompleteModal(false);
      setSelectedTask(null);
      setCompletionNotes('');
      fetchTasks();
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Failed to complete task');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && !['completed', 'approved'].includes(selectedTask?.status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CheckSquare className="h-8 w-8 text-green-600" />
          My Tasks
        </h1>
        <p className="text-gray-600 mt-1">Complete your assigned tasks to earn Ecopoints</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters to see more tasks.'
                : 'You don\'t have any tasks assigned yet.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {/* Task Checkbox */}
                    <button
                      onClick={() => {
                        if (task.status === 'assigned') {
                          setSelectedTask(task);
                          setShowCompleteModal(true);
                        }
                      }}
                      disabled={task.status !== 'assigned'}
                      className={`p-1 rounded ${
                        task.status === 'assigned' 
                          ? 'hover:bg-gray-100 cursor-pointer' 
                          : 'cursor-not-allowed opacity-50'
                      }`}
                    >
                      {task.status === 'assigned' ? (
                        <Square className="h-5 w-5 text-gray-400" />
                      ) : (
                        <CheckSquare className="h-5 w-5 text-green-500" />
                      )}
                    </button>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>

                        {/* Priority Badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                          {getPriorityIcon(task.priority)}
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>

                        {/* Ecopoints */}
                        {task.ecopoints > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-200">
                            <Star className="h-3 w-3" />
                            {task.ecopoints} Ecopoints
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {formatDate(task.dueDate)}
                          {isOverdue(task.dueDate) && (
                            <span className="text-red-500 font-medium">(Overdue)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Assigned by: {task.assignedBy?.name}
                        </div>
                        {task.attachments && task.attachments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <ImageIcon className="h-4 w-4" />
                            {task.attachments.length} attachment(s)
                          </div>
                        )}
                      </div>

                      {/* Completion Notes */}
                      {task.completionNotes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Completion Notes:</span>
                          </div>
                          <p className="text-sm text-blue-800">{task.completionNotes}</p>
                        </div>
                      )}

                      {/* Admin Notes */}
                      {task.adminNotes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">Admin Notes:</span>
                          </div>
                          <p className="text-sm text-gray-700">{task.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Complete Task Modal */}
      {showCompleteModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <CheckSquare className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold">Complete Task</h3>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{selectedTask.title}</h4>
              <p className="text-sm text-gray-600 mb-4">{selectedTask.description}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Notes *
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Describe how you completed this task..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedTask(null);
                  setCompletionNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTaskComplete}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksScreen;






