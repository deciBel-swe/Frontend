'use client';

import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import ContinueButton from './ContinueButton';
import EmailSentConfirmation from './EmailSentConfirmation';

interface NewRegistrationFormProps {
  email: string;
  onClose: () => void;
}

const NewRegistrationForm: React.FC<NewRegistrationFormProps> = ({ email, onClose }) => {
  const [displayName, setDisplayName] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState('');
  const [ageError, setAgeError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Function to calculate age (by years only)
  const calculateAge = (birthYear: string) => {
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(birthYear);
  };

  // Check age when year changes
  const handleYearChange = (value: string) => {
    setYear(value);
    if (value) {
      const age = calculateAge(value);
      if (age < 13) {
        setAgeError("Sorry, but you don't meet SoundCloud's minimum age requirements");
      } else {
        setAgeError('');
      }
    } else {
      setAgeError('');
    }
  };

  // Pre-fill display name from the email (before @) unless user already typed something.
  useEffect(() => {
    if (!displayName && email) {
      setDisplayName(email.split('@')[0]);
    }
  }, [email, displayName]);

  const isFormComplete =
    displayName.trim().length > 0 &&
    month &&
    day &&
    year &&
    gender &&
    !ageError; // Ensure no age error

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) return;

    const userData = {
      email,
      profile: {
        displayName: displayName.trim(),
        dateOfBirth: {
          month,
          day,
          year,
        },
        gender,
      },
      registrationDate: new Date().toISOString(),
      ageVerified: true, // Since we checked age >=13
    };

    // Mock backend call - in real app, send to API
    console.log('📝 New User Registration Data:', userData);

    // Simulate API call
    // fetch('/api/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData)
    // })
    // .then(res => res.json())
    // .then(data => console.log('Registration successful:', data))
    // .catch(err => console.error('Registration failed:', err));

    alert('Registration successful! Check console for data.');
  };

  const months = [
    'Month',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const days = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
  const years = Array.from({ length: 100 }, (_, i) => `${new Date().getFullYear() - i}`);

  return (
    <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="w-[28rem] border border-white flex items-center justify-center rounded py-8">
        <div className="w-[25rem] bg-[#121212]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex items-center gap-7">
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition cursor-pointer"
              >
                <FaArrowLeft className="text-white text-[17px]" />
              </button>
              <h2 className="text-[17px] font-bold mb-1 ml-10" style={{ fontFamily: 'var(--font-sans)' }}>
                Tell us more about you
              </h2>
            </div>

            <div className="space-y-1">
              <div className="relative w-full">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder=" "
                  className="peer w-full h-[3.2rem] rounded bg-[#303030] text-white pl-4 pt-4 pb-2 border border-gray-500/30 focus:border-gray-400 focus:outline-none text-sm"
                />

                <label
                  className={`absolute left-4 text-gray-400 pointer-events-none transition-all duration-200 ${
                    displayName ? 'top-[4px] text-[11px]' : 'top-[17px] text-xs'
                  } peer-focus:top-[4px] peer-focus:text-[11px]`}
                >
                  Display name
                </label>
              </div>
              <div className="text-gray-400 text-xs">
                Your display name can be anything you like. Your name or artist name are good
                choices.
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold select-none">Date of birth (required)</div>
              <div className="flex gap-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="text-sm w-1/2 h-[3.2rem] rounded bg-[#303030] text-white pl-4 pr-3 py-4 border border-gray-500/30 focus:border-gray-400 focus:outline-none appearance-none"
                  style={{
                    backgroundImage:
                      "url('data:image/svg+xml;charset=UTF-8,%3Csvg width=\"12\" height=\"8\" viewBox=\"0 0 12 8\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M1 1l5 5 5-5\" stroke=%22%23FFFFFF%22 stroke-width=\"2\" stroke-linecap=\"round\"/%3E%3C/svg%3E')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '12px 8px',
                  }}
                >
                  <option value="">Month</option>
                  {months.slice(1).map((m, i) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="text-sm w-1/4 h-[3.2rem] rounded bg-[#303030] text-white pl-4 pr-3 py-4 border border-gray-500/30 focus:border-gray-400 focus:outline-none appearance-none"
                  style={{
                    backgroundImage:
                      "url('data:image/svg+xml;charset=UTF-8,%3Csvg width=\"12\" height=\"8\" viewBox=\"0 0 12 8\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M1 1l5 5 5-5\" stroke=%22%23FFFFFF%22 stroke-width=\"2\" stroke-linecap=\"round\"/%3E%3C/svg%3E')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '12px 8px',
                  }}
                >
                  <option value="">Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="text-sm w-1/4 h-[3.2rem] rounded bg-[#303030] text-white pl-4 pr-3 py-4 border border-gray-500/30 focus:border-gray-400 focus:outline-none appearance-none"
                  style={{
                    backgroundImage:
                      "url('data:image/svg+xml;charset=UTF-8,%3Csvg width=\"12\" height=\"8\" viewBox=\"0 0 12 8\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M1 1l5 5 5-5\" stroke=%22%23FFFFFF%22 stroke-width=\"2\" stroke-linecap=\"round\"/%3E%3C/svg%3E')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '12px 8px',
                  }}
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-gray-400 text-xs">
                Your date of birth is used to verify your age and is not shared publicly.
              </div>
              {ageError && (
                <div className="text-red-400 text-xs">
                  {ageError}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="relative w-full">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="text-sm peer w-full h-[3.2rem] rounded bg-[#303030] text-white pl-4 pr-3 pt-4 pb-2 border border-gray-500/30 focus:border-gray-400 focus:outline-none appearance-none"
                  style={{
                    backgroundImage:
                      "url('data:image/svg+xml;charset=UTF-8,%3Csvg width=\"12\" height=\"8\" viewBox=\"0 0 12 8\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M1 1l5 5 5-5\" stroke=%22%23FFFFFF%22 stroke-width=\"2\" stroke-linecap=\"round\"/%3E%3C/svg%3E')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '12px 8px',
                  }}
                >
                  <option value="" disabled></option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
    
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>

                <label
                  className={`absolute left-4 text-gray-400 pointer-events-none transition-all duration-200 ${
                    gender ? 'top-[4px] text-[11px]' : 'top-[17px] text-xs'
                  } peer-focus:top-[4px] peer-focus:text-[11px]`}
                >
                  Gender (required)
                </label>
              </div>
            </div>

            <ContinueButton type="submit" disabled={!isFormComplete}>
              Continue
            </ContinueButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewRegistrationForm;
