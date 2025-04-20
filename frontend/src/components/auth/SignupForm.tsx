import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { AuthLayout } from './AuthLayout';
import { Input } from '../ui/InputAdded';
import { Button } from '../ui/ButtonAdded';
import { GoogleAuthButton } from './GoogleAuthButton';
import { useMutation, gql } from "@apollo/client";

export function SignupForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    matches: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate password in real-time if the password field is being changed
    if (name === 'password') {
      validatePassword(value);
    }
  };

  // Password validation function
  const validatePassword = (password) => {
    // Check if password is at least 8 characters long
    const hasMinLength = password.length >= 8;
    
    // Check if password includes at least one letter and one number
    const hasLetterAndNumber = /^(?=.*[A-Za-z])(?=.*\d).+$/.test(password);
    
    setPasswordErrors({
      minLength: !hasMinLength,
      matches: !hasLetterAndNumber
    });
    
    return hasMinLength && hasLetterAndNumber;
  };

  // GraphQL mutation for user registration
  const REGISTER_USER = gql`
    mutation Register($input: CreateUserDto!) {
      register(input: $input) {
        message
        success
      }
    }
  `;

  const [registerUser] = useMutation(REGISTER_USER, {
    onCompleted: (data) => {
      if (data.register.success) {
        toast({
          title: 'Registration successful',
          description: data.register.message || 'You can now log in with your credentials.',
          variant: 'default',
        });
        navigate('/login');
      } else {
        toast({
          title: 'Registration failed',
          description: data.register.message || 'Please try again.',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      console.error("Registration error:", JSON.stringify(error, null, 2));

      const errorMessage = error.graphQLErrors?.[0]?.message || error.networkError?.message || 'An unexpected error occurred.';
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data being submitted:", formData);

    // Validate password before submission
    if (!validatePassword(formData.password)) {
      let errorMessages = [];
      if (passwordErrors.minLength) {
        errorMessages.push("Password must be at least 8 characters long");
      }
      if (passwordErrors.matches) {
        errorMessages.push("Password must include at least one letter and one number");
      }
      
      toast({
        title: 'Invalid Password',
        description: errorMessages.join('. '),
        variant: 'destructive',
      });
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await registerUser({
        variables: {
          input: {
            email: formData.email,
            password: formData.password,
            profile: {
              fullName: formData.name,
            },
          },
        },
      });
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'Please check your details and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join thousands of learners from around the world"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Full name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          icon={User}
          placeholder="John Doe"
          rightElement={null}
        />

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

        <div className="space-y-2">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            icon={Lock}
            placeholder="Create a password"
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
          {formData.password && (
            <div className="text-xs space-y-1 mt-1">
              <div className={`flex items-center ${passwordErrors.minLength ? 'text-red-500' : 'text-green-500'}`}>
                <span>{passwordErrors.minLength ? '✖' : '✓'}</span>
                <span className="ml-1">Password must be at least 8 characters long</span>
              </div>
              <div className={`flex items-center ${passwordErrors.matches ? 'text-red-500' : 'text-green-500'}`}>
                <span>{passwordErrors.matches ? '✖' : '✓'}</span>
                <span className="ml-1">Password must include at least one letter and one number</span>
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          icon={Lock}
          placeholder="Confirm your password"
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

        <div className="text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Privacy Policy
            </Link>
          </p>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
        >
          Create account
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
            to="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}