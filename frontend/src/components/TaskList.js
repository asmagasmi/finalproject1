import React from 'react';
import { tasksAPI } from '../services/api';
import { toast } from 'react-toastify';

const TaskList = ({ tasks, onEditTask, onDeleteTask, onTaskUpdate }) => {
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateTask(taskId, { status: newStatus });
      onTaskUpdate();
      toast.success('Task status updated!');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="task-list">
        <div className="task-card">
          <p>No tasks found. Create your first task!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div 
          key={task._id} 
          className="task-card"
          style={{ borderLeftColor: getPriorityColor(task.priority) }}
        >
          <div className="task-header">
            <div>
              <h3 className="task-title">{task.title}</h3>
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
            </div>
            <div className="task-actions">
              <button 
                onClick={() => onEditTask(task)}
                className="btn btn-sm"
              >
                Edit
              </button>
              <button 
                onClick={() => onDeleteTask(task._id)}
                className="btn btn-sm btn-danger"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="task-meta">
            <span 
              className="task-tag"
              style={{ 
                backgroundColor: `${getStatusColor(task.status)}20`,
                color: getStatusColor(task.status)
              }}
            >
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            
            <span 
              className="task-tag"
              style={{ 
                backgroundColor: `${getPriorityColor(task.priority)}20`,
                color: getPriorityColor(task.priority)
              }}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>
            
            <span className="task-tag">
              📅 {formatDate(task.deadline)}
            </span>
          </div>

          <div className="status-actions">
            <label>Update Status:</label>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task._id, e.target.value)}
              className="btn-sm"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;