import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { verifyAdminPassword, updateAdminPasswordInFirebase } from '../firebase.js';

export const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Change password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Verifies against the SHA-256 hash stored in Firebase Firestore
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        setPassword('');
        onLoginSuccess();
        onClose();
      } else {
        setError('Incorrect passcode. Please check your credentials.');
      }
    } catch (err) {
      setError('Unable to authenticate with Firebase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPass.length < 4) {
      setError('New passcode must be at least 4 characters long.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('New passcodes do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await updateAdminPasswordInFirebase(currentPass, newPass);
      setSuccessMsg('Passcode updated in Firebase! Use your new passcode next time.');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => {
        setIsChangingPassword(false);
        setSuccessMsg('');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to update passcode in Firebase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 border border-indigo-800/60">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isChangingPassword ? 'Update Passcode' : 'Admin Login'}
              </h2>
              <p className="text-[10px] text-zinc-400">Authenticated with Firebase Firestore</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError('');
              setSuccessMsg('');
              setIsChangingPassword(false);
              onClose();
            }}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!isChangingPassword ? (
          /* Normal Admin Login Form */
          <form onSubmit={handleLogin} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Admin Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  autoFocus
                  required
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Initial default passcode: <b className="text-zinc-400">admin123</b>
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsChangingPassword(true);
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
              >
                Change Passcode
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isLoading ? 'Verifying...' : 'Unlock Admin'}</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Change Password in Firebase Form */
          <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Current Passcode *
              </label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Current passcode"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                New Passcode *
              </label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="New passcode (min 4 chars)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Confirm New Passcode *
              </label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Confirm new passcode"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsChangingPassword(false);
                }}
                className="text-[11px] text-zinc-400 hover:text-white"
              >
                Back to Login
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isLoading ? 'Saving...' : 'Save in Firebase'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
