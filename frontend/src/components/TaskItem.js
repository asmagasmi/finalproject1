import React, { useState } from 'react';
import { tasksAPI } from '../services/api';
import { toast } from 'react-toastify';

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      await tasksAPI.updateTask(task._id, { status: newStatus });
      toast.success(`Task marked as ${newStatus}!`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      try {
        await tasksAPI.deleteTask(task._id);
        toast.success('Task deleted successfully!');
        onDelete();
      } catch (error) {
        toast.error('Failed to delete task');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = async () => {
    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle && newTitle.trim() !== '') {
      const newDescription = prompt('Edit description:', task.description || '');
      const newPriority = prompt('Edit priority (low/medium/high):', task.priority);
      
      if (newPriority && !['low', 'medium', 'high'].includes(newPriority.toLowerCase())) {
        toast.error('Priority must be low, medium, or high');
        return;
      }

      setLoading(true);
      try {
        await tasksAPI.updateTask(task._id, {
          title: newTitle.trim(),
          description: newDescription,
          priority: newPriority.toLowerCase()
        });
        toast.success('Task updated successfully!');
        onUpdate();
      } catch (error) {
        toast.error('Failed to update task');
      } finally {
        setLoading(false);
      }
    }
  };

  const isOverdue = !task.completed && task.deadline && new Date(task.deadline) < new Date();
  const deadlineDate = task.deadline ? new Date(task.deadline) : null;

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'pending': return '⏳';
      default: return '📝';
    }
  };

  return (
    <div className={`task-item ${task.status} priority-${task.priority} ${isOverdue ? 'overdue' : ''}`}>
      <div className="task-header">
        <div className="task-title-section">
          <h4 className="task-title">{task.title}</h4>
          <div className="task-meta">
            <span className={`priority-badge priority-${task.priority}`}>
              {getPriorityIcon(task.priority)} {task.priority} priority
            </span>
            <span className={`status-badge status-${task.status}`}>
              {getStatusIcon(task.status)} {task.status}
            </span>
          </div>
        </div>
        
        <div className="task-actions">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={loading}
            className="status-select"
          >
            <option value="pending">⏳ Pending</option>
            <option value="in-progress">🔄 In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
          
          <button 
            onClick={handleEdit}
            disabled={loading}
            className="btn btn-edit"
            title="Edit task"
          >
            ✏️
          </button>
          
          <button 
            onClick={handleDelete}
            disabled={loading}
            className="btn btn-delete"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-footer">
        <div className="task-deadline">
          <span className="deadline-label">
            {isOverdue ? '⏰ Overdue:' : '📅 Deadline:'}
          </span>
          <span className={`deadline-time ${isOverdue ? 'overdue-text' : ''}`}>
            {deadlineDate ? deadlineDate.toLocaleString() : 'No deadline'}
          </span>
        </div>
        
        <div className="task-created">
          Created: {new Date(task.createdAt).toLocaleDateString()}
        </div>
      </div>

      {loading && (
        <div className="task-loading">
          <div className="loading-spinner small"></div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;