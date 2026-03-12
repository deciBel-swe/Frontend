'use client';

import React from 'react'
import Header from '../../../usablecomponents/Header/Header'
import RegistrationForm from './components/RegistrationForm'
import { useRedirectAfterLogin } from '@/hooks';

export default function Page() {
  useRedirectAfterLogin();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <>This is a sign in page</>
      <RegistrationForm />
)}