import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Edit, Save, X, Upload, Camera } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import userService from '../services/userService';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });

  // Update form data when user changes
  useEffect(() => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      bio: user?.bio || ''
    });
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setSelectedAvatar(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatar) return;

    try {
      setAvatarLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', selectedAvatar);

      const response = await userService.updateUser(user._id, formData);
      
      // Update user context
      updateUser(response.user);
      
      toast.success('Avatar updated successfully!');
      setSelectedAvatar(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to update avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const response = await userService.updateUser(user._id, formData);
      
      // Update user context
      updateUser(response.user);
      
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      bio: user?.bio || ''
    });
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-heading font-bold text-gray-900">My Profile</h1>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-primary">
                <Edit size={16} className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="card p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600 overflow-hidden">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    `${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`
                  )}
                </div>
                
                {/* Avatar Upload Button */}
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-colors">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Avatar Preview and Upload */}
              {selectedAvatar && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <img 
                    src={avatarPreview} 
                    alt="Preview" 
                    className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                  />
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleAvatarUpload}
                      disabled={avatarLoading}
                      className="btn-primary text-sm"
                    >
                      {avatarLoading ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        'Upload'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAvatar(null);
                        setAvatarPreview(null);
                      }}
                      className="btn-outline text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {user.firstName} {user.lastName}
              </h2>
              <span className={`badge ${user.role === 'student' ? 'badge-primary' : 'badge-success'} capitalize`}>
                {user.role}
              </span>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <Mail size={14} className="mr-2" />
                  {user.email}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                  {editing && (
                    <div className="flex gap-2">
                      <button onClick={handleCancel} className="btn-outline">
                        <X size={16} className="mr-2" />
                        Cancel
                      </button>
                      <button onClick={handleSave} disabled={loading} className="btn-primary">
                        {loading ? <LoadingSpinner size="sm" color="white" /> : (
                          <>
                            <Save size={16} className="mr-2" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      {editing ? (
                        <input
                          type="text"
                          name="firstName"
                          className="input"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                          {user.firstName}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      {editing ? (
                        <input
                          type="text"
                          name="lastName"
                          className="input"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                          {user.lastName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                      {user.email}
                      <span className="text-xs ml-2">(Cannot be changed)</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    {editing ? (
                      <textarea
                        name="bio"
                        rows={4}
                        className="input"
                        placeholder="Tell us about yourself..."
                        value={formData.bio}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md min-h-[100px]">
                        {user.bio || 'No bio provided'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
