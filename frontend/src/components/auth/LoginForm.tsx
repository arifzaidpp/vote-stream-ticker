import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { AuthLayout } from './AuthLayout';

import { GoogleAuthButton } from './GoogleAuthButton';

import { Button } from '../ui/ButtonAdded';
import { Input } from '../ui/InputAdded';
import { useMutation, gql } from "@apollo/client";


export function LoginForm() {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // GraphQL mutation for user login
  const LOGIN_USER = gql`
    mutation Login($input: LoginDto!) {
      login(input: $input) {
        user {
          email
          role
          profile {
            fullName
            avatarUrl
            createdAt
            updatedAt
          }
          googleId
          id
          createdAt
        }
        token
      }
    }
  `;
  const [loginUser] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      // Handle successful login
      const { token, user } = data.login;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.profile.fullName}!`,
        variant: 'default',
      });
      navigate('/admin/elections');
    },
    onError: (error) => {
      // Handle login error
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginUser({
        variables: {
          input: {
            email: formData.email,
            password: formData.password,
          },
        },
      });
      
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Please check your email and password.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          icon={Mail}
          placeholder="you@example.com"
          rightElement={null}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          icon={Lock}
          placeholder="Enter your password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              Remember me
            </label>
          </div>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
        >
          Sign in
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleAuthButton />

        <div className="text-center">
          <Link
            to="/signup"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}