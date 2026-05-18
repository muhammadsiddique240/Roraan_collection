import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUserProfile, isLoading } = useStore();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username);
      if (user.profile?.avatar) {
        setAvatarPreview(user.profile.avatar);
      }
    }
  }, [user]);

  const handleUpdateName = async () => {
    if (!name.trim()) return toast.error('Name cannot be empty');
    try {
      await updateUserProfile({ name });
    } catch (err) { }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) return toast.error('Please fill password fields');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    try {
      await updateUserProfile({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) { }
  };

  const handleAvatarChange = async (file: File) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    try {
      await updateUserProfile({ avatar: file });
    } catch (err) { }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile and security</p>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-8">
        {/* Profile Picture */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold text-xl uppercase">
                  {user?.username?.slice(0, 2) || 'AD'}
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={20} />
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                id="avatar-upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarChange(file);
                }}
              />
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Upload / Update Picture
              </label>
            </div>
          </div>
        </div>

        {/* User Name */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Display Name</h2>
          <div className="max-w-md flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              placeholder="Enter your name"
            />
            <button
              onClick={handleUpdateName}
              disabled={isLoading}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>

        {/* Security / Password */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Security</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                placeholder="Confirm new password"
              />
            </div>
            <button
              onClick={handleUpdatePassword}
              disabled={isLoading}
              className="mt-2 px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={16} />}
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
