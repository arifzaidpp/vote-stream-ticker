import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';
import { gql, useApolloClient, useMutation } from '@apollo/client';
import { toast } from '@/components/ui/use-toast';

const VERIFY_ELECTION_ACCESS_CODE = gql`
    mutation VerifyElectionAccessCode($accessCode: String!) {
        verifyElectionAccessCode(accessCode: $accessCode) {
            success
            message
            id
        }
    }
`;

export const AccessPage: React.FC = () => {
    const OTP_LENGTH = 6;
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [activeInput, setActiveInput] = useState<number>(0);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();
      const client = useApolloClient();

    const [verifyAccessCode] = useMutation(VERIFY_ELECTION_ACCESS_CODE);

    const handleChange = (value: string, index: number) => {
        if (!/^[0-9]*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        setHasError(false);
        setErrorMessage('');

        if (value && index < OTP_LENGTH - 1) setActiveInput(index + 1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
            setActiveInput(index - 1);
        } else if (e.key === 'ArrowLeft' && index > 0) {
            setActiveInput(index - 1);
        } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            setActiveInput(index + 1);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').split('').slice(0, OTP_LENGTH);
        if (pastedData.every(char => /^[0-9]$/.test(char))) {
            setOtp(pastedData);
            setActiveInput(pastedData.length < OTP_LENGTH ? pastedData.length : OTP_LENGTH - 1);
        }
    };

    const verifyOtp = async () => {
        setIsVerifying(true);
        try {
            const { data } = await verifyAccessCode({
                variables: { accessCode: otp.join('') },
            });
            if (data?.verifyElectionAccessCode?.success) {
                setIsSuccess(true);
                toast({
                    title: 'Verification Successful',
                    description: 'You can now access the election results.',
                    variant: 'default',
                });
                setIsRedirecting(true); // Set redirecting state
                setTimeout(() => {
                    resetState();
                    navigate(`/election/${data.verifyElectionAccessCode.id}`);
                }, 1000); // Delay before navigating
            } else {
                handleError(data.verifyElectionAccessCode.message || 'Verification failed.');
            }
        } catch (error) {
            handleError('An error occurred during verification. Please try again.');
            console.error('Verification error:', error);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleError = (message: string) => {
        setHasError(true);
        setErrorMessage(message);
        toast({
            title: 'Verification Failed',
            description: message,
            variant: 'destructive',
        });
    };

    const resetState = () => {
        setOtp(Array(OTP_LENGTH).fill(''));
        setActiveInput(0);
        setHasError(false);
        setErrorMessage('');
        setIsSuccess(false);
        setIsRedirecting(false);
    };

    const LOGOUT_USER = gql`
        mutation Logout {
          logout {
            message
            success
          }
        }
      `;
      
      const [logoutUser] = useMutation(LOGOUT_USER, {
        onCompleted: (data) => {
          // Handle successful logout
          if (data?.logout?.success) {
            toast({
              title: "Logout Successful",
              description: data.logout.message,
              variant: "default",
            });
          } else {
            console.log("Logout response:", data);
          }
          
          // Always clean up local storage and navigate away
          performClientSideLogout();
        },
        onError: (error) => {
          // Handle error - this might be the authentication error
          console.error("Logout error:", error);
          toast({
            title: "Server Logout Failed",
            description: "Logging out locally instead",
            variant: "default",
          });
          
          // Even if server logout fails, do local logout
          performClientSideLogout();
        }
      });
      
      const performClientSideLogout = () => {
        // Clean up local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Reset Apollo cache
        client.resetStore();
        
        // Navigate to login page
        navigate('/login');
      };
      
      const handleLogout = () => {
        // Try server-side logout first
        try {
          logoutUser();
        } catch (e) {
          console.error("Error initiating logout:", e);
          // Fallback to client-side logout
          performClientSideLogout();
        }
      };

    useEffect(() => {
        if (otp.every(digit => digit !== '') && !isVerifying && !isSuccess) verifyOtp();
    }, [otp]);

    useEffect(() => {
        inputRefs.current[activeInput]?.focus();
    }, [activeInput]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 mb-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 text-center">Access Code Verification</h1>
                        <p className="text-gray-600 text-center mt-2">
                            Enter the access code to get election results.
                        </p>
                        <div className="bg-green-50 rounded-lg px-4 py-2 mt-4 text-center">
                            <span className="text-gray-500 text-sm">Contact election controller to get access code</span>
                            <p className="text-green-800 font-medium">election.result.official@gmail.com</p>
                        </div>
                    </div>

                    <div className="flex justify-center gap-2">
                        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                            <input
                                key={index}
                                ref={el => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={otp[index] || ''}
                                onChange={e => handleChange(e.target.value, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                onPaste={handlePaste}
                                onFocus={() => setActiveInput(index)}
                                className={`
                                    w-12 h-16 text-center text-2xl font-semibold border-2 rounded-lg
                                    focus:outline-none transition-all duration-200
                                    ${isSuccess ? 'border-green-500 bg-green-50 text-green-700' :
                                        hasError ? 'border-red-500 bg-red-50 text-red-700' :
                                        activeInput === index ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}
                                `}
                            />
                        ))}
                    </div>

                    {isVerifying && (
                        <div className="flex justify-center mt-4">
                            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                        </div>
                    )}

                    {hasError && (
                        <div className="mt-3 text-center">
                            <p className="text-sm text-red-600">{errorMessage}</p>
                        </div>
                    )}

                    {isSuccess && !isRedirecting && (
                        <div className="flex flex-col items-center mt-4">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <p className="text-xl font-medium text-green-800">Verification Successful</p>
                        </div>
                    )}

                    {isRedirecting && (
                        <div className="flex flex-col items-center mt-4">
                            <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-4" />
                            <p className="text-xl font-medium text-green-800">Redirecting...</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all duration-200"
                >
                    Logout
                </button>

                <p className="text-center text-gray-500 text-sm mt-4">
                    Need help? <a href="#" className="text-green-600 hover:underline">Contact Support</a>
                </p>
            </div>
        </div>
    );
};
