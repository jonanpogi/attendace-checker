'use client';

import { useEffect, useState } from 'react';
import Icon, { IconName } from '../Icons';
import { usePortal } from '@/hooks/usePortal';
import AnimatedContent from '../react-bits/AnimatedContent';
import Image from 'next/image';
import LoadingSpinner from '../LoadingSpinner';
import ButtonPrimary from '../ButtonPrimary';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
};

type FormData = {
  username: string;
  password: string;
};

const fields = [
  {
    name: 'username' as keyof FormData,
    label: 'User Name',
    icon: 'User',
    placeHolder: 'e.g. johndoe',
    type: 'text',
  },
  {
    name: 'password' as keyof FormData,
    label: 'Password',
    icon: 'Lock',
    placeHolder: 'e.g. ********',
    type: 'password',
  },
];

const initialFormData: FormData = {
  username: '',
  password: '',
};

const LoginModal = ({ isOpen, onClose, onLoginSuccess }: Props) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onLoginSuccess?.();
        onClose();
        return;
      } else {
        setErrorMessage('Login failed. Please check your credentials.');
        return;
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Login failed. Please try again.');
    } finally {
      setFormData(initialFormData);
      setLoading(false);
    }
  };

  useEffect(() => {
    const isValid = Object.values(formData).every(
      (value) => value?.trim() !== '',
    );
    setValidated(!isValid);
  }, [formData]);

  const portal = usePortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <AnimatedContent
        direction="vertical"
        ease="power3.out"
        reverse={false}
        animateOpacity={true}
        distance={300}
        duration={1.5}
        delay={0}
        initialOpacity={1}
        className="relative w-full max-w-sm rounded-lg bg-slate-900 p-6 pb-1 shadow-lg shadow-slate-700"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:scale-105"
        >
          <Icon name="X" className="h-5 w-5" />
        </button>
        <Image
          src={'122nd_logo.svg'}
          alt="Logo"
          width={50}
          height={50}
          className="mb-8 inline-block"
        />

        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-xl font-bold">Sign-in</h2>
          <Icon name={'LogIn'} className="h-5 w-5 text-gray-50 sm:h-6 sm:w-6" />
        </div>

        <p className="mb-8 text-xs text-gray-400 italic sm:text-sm">
          Please sign in to continue. If you don&apos;t have an account, please
          contact the IT Committee.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div className="mb-2" key={index}>
              <div className="mb-1 flex items-center gap-1">
                <Icon name={field.icon as IconName} className="h-3 w-3" />
                <label className="block text-sm capitalize">
                  {field.label}
                </label>
              </div>

              <input
                type={field.type}
                placeholder={field.placeHolder}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-gray-800 p-2"
              />
            </div>
          ))}

          {errorMessage && (
            <p className="mb-4 text-sm text-red-500">{errorMessage}</p>
          )}

          <ButtonPrimary
            type="submit"
            disabled={loading || validated}
            className="mb-4 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {loading ? <LoadingSpinner color="text-gray-50" /> : 'Submit'}
          </ButtonPrimary>
        </form>
      </AnimatedContent>
    </div>,
  );

  if (!isOpen) return null;

  return portal;
};

export default LoginModal;
