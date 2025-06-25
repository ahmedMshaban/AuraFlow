import { useState } from 'react';
import type { CreateTaskData, TaskFormData } from '@/shared/types/task.types';

const useTaskForm = (onSubmit: (data: CreateTaskData) => Promise<void>, onClose: () => void) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange =
    (field: keyof TaskFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData((prev: TaskFormData) => ({
        ...prev,
        [field]: e.target.value,
      }));
      // Clear errors when user starts typing
      if (errors.length > 0) {
        setErrors([]);
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!formData.title.trim()) {
      newErrors.push('Task title is required');
    }

    if (!formData.dueDate) {
      newErrors.push('Due date is required');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const taskData: CreateTaskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: new Date(formData.dueDate),
        priority: formData.priority,
      };

      await onSubmit(taskData);

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
      });
      setErrors([]);
      onClose();
    } catch {
      setErrors(['Failed to create task. Please try again.']);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
    });
    setErrors([]);
    onClose();
  };

  return {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
    handleClose,
  };
};

export default useTaskForm;
