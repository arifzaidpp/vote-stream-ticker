import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, gql } from "@apollo/client";

const VERIFY_EMAIL = gql`
  mutation VerifyEmail($input: VerifyEmailDto!) {
    verifyEmail(input: $input) {
      message
      success
      user {
        id
        email
        profile {
          fullName
        }
      }
    }
  }
`;

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const token = searchParams.get("token");

  const [verifyEmail] = useMutation(VERIFY_EMAIL, {
    onCompleted: (data) => {
      if (data?.verifyEmail?.success) {
        setStatus("success");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setStatus("error");
      }
    },
    onError: () => {
      setStatus("error");
    },
  });

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    verifyEmail({ variables: { input: { token } } });
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white shadow-lg p-8 rounded-2xl text-center max-w-sm w-full"
          >
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
            <h2 className="text-xl font-semibold mt-4">Verifying Email...</h2>
            <p className="text-sm text-gray-500 mt-2">Please wait while we verify your email.</p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white shadow-lg p-8 rounded-2xl text-center max-w-sm w-full"
          >
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="text-xl font-semibold mt-4">Email Verified!</h2>
            <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white shadow-lg p-8 rounded-2xl text-center max-w-sm w-full"
          >
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold mt-4">Verification Failed</h2>
            <p className="text-sm text-gray-500 mt-2">The token may be invalid or expired.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifyEmail;
