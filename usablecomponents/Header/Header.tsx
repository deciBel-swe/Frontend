'use client';
import logo from '@/images/logo.png';
import { useAuth } from '@/features/auth';
import LoggedOutHeader from './LoggedOutHeader';
import LoggedInHeader from './LoggedInHeader';

export default function Header() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <LoggedInHeader /> : <LoggedOutHeader />;
}