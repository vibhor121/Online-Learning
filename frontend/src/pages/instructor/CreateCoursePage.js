import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BookOpen, Save, Upload, X, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import courseService from '../../services/courseService';

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const categories = [
    'Programming', 'Web Development', 'Mobile Development', 'Data Science', 
    'Machine Learning', 'Design', 'Business', 'Marketing', 'Photography', 
    'Music', 'Language', 'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data) => {
    // Validate image upload
    if (!selectedImage) {
      toast.error('Please upload a course thumbnail image');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add course data
      formData.append('title', data.title);
      formData.append('shortDescription', data.shortDescription);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('level', data.level);
      formData.append('price', parseFloat(data.price));
      formData.append('duration', parseInt(data.duration));
      formData.append('language', data.language || 'English');
      formData.append('isPublished', 'true'); // Automatically publish courses
      
      // Add structured data as JSON strings
      formData.append('whatYouWillLearn', JSON.stringify([
        'Master the fundamentals',
        'Build real-world projects', 
        'Apply best practices',
        'Gain practical experience'
      ]));
      
      formData.append('requirements', JSON.stringify([
        'Basic computer skills',
        'Internet connection',
        'Willingness to learn'
      ]));
      
      formData.append('tags', JSON.stringify([data.category.toLowerCase().replace(/\s+/g, '-')]));
      
      // Add image if selected
      if (selectedImage) {
        formData.append('thumbnail', selectedImage);
        toast.loading('Uploading course image...', { id: 'upload' });
      }

      const response = await courseService.createCourse(formData);
      toast.dismiss('upload');
      toast.success('Course created successfully!');
      navigate('/instructor/courses');
      
    } catch (error) {
      console.error('Create course error:', error);
      
      // Show specific validation errors if available
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        validationErrors.forEach(err => {
          toast.error(`${err.path}: ${err.msg}`);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container py-6">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-primary-600 mr-3" />
            <h1 className="text-2xl font-heading font-bold text-gray-900">
              Create New Course
            </h1>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="card p-8">
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">Course Title *</label>
                <input
                  type="text"
                  className={`input ${errors.title ? 'input-error' : ''}`}
                  placeholder="Enter course title"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
              </div>

              {/* Course Thumbnail Upload */}
              <div className="form-group">
                <label className="form-label">Course Thumbnail *</label>
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    imagePreview ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                  }`}>
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Course thumbnail preview"
                          className="max-w-full h-48 object-cover rounded-lg mx-auto"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <div className="mt-3 text-sm text-green-600 font-medium">
                          ✓ Image selected: {selectedImage?.name}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <div className="space-y-2">
                          <p className="text-lg font-medium text-gray-700">Upload Course Thumbnail</p>
                          <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          <label className="btn-primary inline-flex items-center cursor-pointer">
                            <Upload size={16} className="mr-2" />
                            Choose Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    <strong>Required:</strong> Upload an attractive course thumbnail image. This will be displayed on course cards and helps students choose your course.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Description *</label>
                <textarea
                  rows={2}
                  className={`input ${errors.shortDescription ? 'input-error' : ''}`}
                  placeholder="Brief description of your course (20-200 characters)"
                  {...register('shortDescription', { 
                    required: 'Short description is required',
                    minLength: { value: 20, message: 'Short description must be at least 20 characters' },
                    maxLength: { value: 200, message: 'Short description must be less than 200 characters' }
                  })}
                />
                {errors.shortDescription && <p className="form-error">{errors.shortDescription.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Full Description *</label>
                <textarea
                  rows={6}
                  className={`input ${errors.description ? 'input-error' : ''}`}
                  placeholder="Detailed description of your course content, what students will learn, and course objectives (minimum 50 characters)"
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: { value: 50, message: 'Description must be at least 50 characters' },
                    maxLength: { value: 2000, message: 'Description must be less than 2000 characters' }
                  })}
                />
                {errors.description && <p className="form-error">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className={`input ${errors.category ? 'input-error' : ''}`}
                    {...register('category', { required: 'Category is required' })}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="form-error">{errors.category.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Level *</label>
                  <select
                    className={`input ${errors.level ? 'input-error' : ''}`}
                    {...register('level', { required: 'Level is required' })}
                  >
                    <option value="">Select Level</option>
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  {errors.level && <p className="form-error">{errors.level.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Price (USD) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`input ${errors.price ? 'input-error' : ''}`}
                    placeholder="0.00"
                    {...register('price', { required: 'Price is required' })}
                  />
                  {errors.price && <p className="form-error">{errors.price.message}</p>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duration (hours) *</label>
                <input
                  type="number"
                  min="1"
                  className={`input ${errors.duration ? 'input-error' : ''}`}
                  placeholder="10"
                  {...register('duration', { required: 'Duration is required' })}
                />
                {errors.duration && <p className="form-error">{errors.duration.message}</p>}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? <LoadingSpinner size="sm" color="white" /> : (
                    <>
                      <Save size={16} className="mr-2" />
                      Create Course
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/instructor/courses')}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;
