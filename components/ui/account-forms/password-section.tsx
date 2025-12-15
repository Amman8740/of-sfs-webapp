'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/client';
import { Button, PasswordInput } from '@/components/ui';

export default function PasswordSection() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Password visibility states
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  // Password validation states
  const isValidLength = newPassword.length >= 8;
  const containsCharsAndNums = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword);
  const containsSpecialOrLong = newPassword.length < 12 ? /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) : true;
  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';
  
  // Check if form is valid and can be submitted
  const isFormValid = 
    currentPassword && 
    newPassword && 
    confirmPassword && 
    isValidLength && 
    containsCharsAndNums && 
    containsSpecialOrLong && 
    passwordsMatch;
  
  // Get user email on component mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    };
    
    fetchUserEmail();
  }, []);
  
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewPassword(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');
    
    if (!userEmail) {
      setError('Could not authenticate user. Please refresh the page and try again.');
      setIsSubmitting(false);
      return;
    }
    
    // Validate passwords
    if (!isValidLength || !containsCharsAndNums || !containsSpecialOrLong) {
      setError('Please meet all password requirements');
      setIsSubmitting(false);
      return;
    }
    
    if (!passwordsMatch) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }
    
    // Use Supabase to update password
    try {
      const supabase = createClient();
      
      // First authenticate with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword
      });
      
      if (signInError) {
        setError('Current password is incorrect');
        setIsSubmitting(false);
        return;
      }
      
      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage('Password updated successfully');
        
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password validation UI
  const PasswordValidationList = () => (
    <div className="text-sm space-y-2 mt-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 h-5 w-5 mr-2">
          {isValidLength ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 12.75L10.5 18.75L19.5 5.25" stroke="#0091FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span className={isValidLength ? "text-canvas-text-contrast" : "text-canvas-text"}>
          Must contain at least 8 characters
        </span>
      </div>
      
      <div className="flex items-start">
        <div className="flex-shrink-0 h-5 w-5 mr-2">
          {containsCharsAndNums ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 12.75L10.5 18.75L19.5 5.25" stroke="#0091FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span className={containsCharsAndNums ? "text-canvas-text-contrast" : "text-canvas-text"}>
          Must contain uppercase, lowercase letters, and numbers
        </span>
      </div>
      
      <div className="flex items-start">
        <div className="flex-shrink-0 h-5 w-5 mr-2">
          {containsSpecialOrLong ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 12.75L10.5 18.75L19.5 5.25" stroke="#0091FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span className={containsSpecialOrLong ? "text-canvas-text-contrast" : "text-canvas-text"}>
          If less than 12 characters, must contain a special character
        </span>
      </div>
      
      <div className="flex items-start">
        <div className="flex-shrink-0 h-5 w-5 mr-2">
          {passwordsMatch && confirmPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 12.75L10.5 18.75L19.5 5.25" stroke="#0091FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span className={passwordsMatch && confirmPassword ? "text-canvas-text-contrast" : "text-canvas-text"}>
          Both passwords must match
        </span>
      </div>
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
      <div className="grid grid-cols-2">
        {/* Left section - Title and description */}
        <div className="p-8 bg-[#FCFCFC]">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Change Password</h2>
          <p className="text-gray-600">We recommend that you periodically update your password to help prevent unauthorized access to your account.</p>
        </div>
        
        {/* Right section - Form */}
        <div className="p-8 bg-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className="text-sm p-3 rounded bg-green-50 text-green-700 border border-green-200">
              {message}
            </div>
          )}
          
          {error && (
            <div className="text-sm p-3 rounded bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}
          
          <div>
            <PasswordInput 
              id="currentPassword"
              label="Current Password"
              placeholder="Your Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              isVisible={currentPasswordVisible}
              onToggleVisibility={() => setCurrentPasswordVisible(!currentPasswordVisible)}
            />
          </div>
          
          <div>
            <PasswordInput 
              id="newPassword"
              label="New Password"
              placeholder="Your New Password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              isVisible={newPasswordVisible}
              onToggleVisibility={() => setNewPasswordVisible(!newPasswordVisible)}
            />
          </div>
          
          <div>
            <PasswordInput 
              id="confirmPassword"
              label="Confirm New Password"
              placeholder="Confirm Your New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isVisible={confirmPasswordVisible}
              onToggleVisibility={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            />
          </div>
          
          <PasswordValidationList />
          
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                color="primary"
                size="medium"
                variant="solid"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
