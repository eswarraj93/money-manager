import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Settings = () => {
    const { user, logout } = useAuth();
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validate password change
        if (formData.newPassword) {
            if (!formData.currentPassword) {
                setMessage({ type: 'error', text: 'Current password is required to change password' });
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setMessage({ type: 'error', text: 'New passwords do not match' });
                return;
            }
            if (formData.newPassword.length < 6) {
                setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
                return;
            }
        }

        setLoading(true);

        try {
            const updateData = {
                name: formData.name,
                email: formData.email,
            };

            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const response = await api.put('/auth/profile', updateData);

            // Update local storage
            const updatedUser = {
                _id: response.data._id,
                name: response.data.name,
                email: response.data.email,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Clear password fields
            setFormData({
                ...formData,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            // If password was changed, logout after 2 seconds
            if (formData.newPassword) {
                setTimeout(() => {
                    addToast('Password changed successfully. Please login again.', 'success');
                    logout();
                }, 2000);
            }
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to update profile',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
                        <p className="text-gray-600 mt-1">Manage your account settings</p>
                    </div>
                    <Link to="/dashboard" className="btn-secondary">
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Profile Settings */}
                <div className="card">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                        Profile Information
                    </h3>

                    {message.text && (
                        <div
                            className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                                ? 'bg-success-50 border border-success-200 text-success-700'
                                : 'bg-danger-50 border border-danger-200 text-danger-700'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="input-field"
                                placeholder="Your name"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="input-field"
                                placeholder="your@email.com"
                            />
                        </div>

                        <hr className="my-6" />

                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Change Password
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Leave blank if you don't want to change your password
                        </p>

                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter current password"
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter new password (min 6 characters)"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Confirm new password"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Account Actions */}
                <div className="card mt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Account Actions
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Logout</p>
                                <p className="text-sm text-gray-600">Sign out of your account</p>
                            </div>
                            <button onClick={logout} className="btn-secondary">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
