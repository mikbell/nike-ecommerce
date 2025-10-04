"use client";

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { authClient } from '@/lib/auth/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthHook extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): AuthHook {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      
      setState(prev => ({
        ...prev,
        user: session.data?.user || null,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Auth check failed:', error);
      setState(prev => ({
        ...prev,
        user: null,
        isLoading: false,
        error: 'Errore durante la verifica dell\'autenticazione',
      }));
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.data) {
        setState(prev => ({
          ...prev,
          user: result.data.user,
          isLoading: false,
          error: null,
        }));
        return { success: true };
      } else {
        const errorMessage = result.error?.message || 'Errore durante l\'accesso';
        setState(prev => ({
          ...prev,
          user: null,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      const errorMessage = 'Errore durante l\'accesso';
      setState(prev => ({
        ...prev,
        user: null,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.data) {
        setState(prev => ({
          ...prev,
          user: result.data.user,
          isLoading: false,
          error: null,
        }));
        return { success: true };
      } else {
        const errorMessage = result.error?.message || 'Errore durante la registrazione';
        setState(prev => ({
          ...prev,
          user: null,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      const errorMessage = 'Errore durante la registrazione';
      setState(prev => ({
        ...prev,
        user: null,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await authClient.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setState({
        user: null,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    await checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };
}
