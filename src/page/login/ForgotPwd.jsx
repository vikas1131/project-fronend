import React, { useState } from 'react';
import apiClientUser from '../../utils/apiClientUser';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    // reusable API request function
    const sendResetRequest = async (data, onSuccess, errorMessage) => {
        try {
            const response = await apiClientUser.post('/users/reset', data);
            if (response.data.user.success) {
                onSuccess(response.data);
            } else {
                toast.error(response.data.user.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || errorMessage);
        }
    };

    // handle Email Verification
    const handleEmailSubmit = (e) => {
        e.preventDefault();
        sendResetRequest(
            { email },
            (data) => {
                setSecurityQuestion(data.user.securityQuestion);
                setStep(2);
            },
            "Error verifying email"
        );
    };

    // handle Security Answer Verification
    const handleSecurityAnswerSubmit = (e) => {
        e.preventDefault();
        sendResetRequest(
            { email, securityAnswer: securityAnswer.trim() },
            () => setStep(3),
            "Error verifying security answer"
        );
    };

    // handle Password Reset
    const handlePasswordReset = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        sendResetRequest(
            { email, newPassword },
            () => {
                toast.success("Password reset successfully!");
                setTimeout(() => navigate('/login'),2000);
            },
            "Error resetting password"
        );
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar /> {/* Toast container */}
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

                {/* Step 1: Verify Email */}
                {step === 1 && (
                    <form onSubmit={handleEmailSubmit}>
                        <label htmlFor="email" className="block mb-2">Enter Email</label>
                        <input
                            id='email'
                            type="email" 
                            className="w-full p-2 border rounded" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                        <button type="submit" className="w-full mt-4 bg-blue-500 text-white py-2 rounded">
                            Verify Email
                        </button>
                    </form>
                )}

                {/* Step 2: Verify Security Answer */}
                {step === 2 && (
                    <form onSubmit={handleSecurityAnswerSubmit}>
                        <label htmlFor="securityAnswer" className="block mb-2">Security Question</label>
                        <p className="mb-2 text-gray-700 font-semibold">{securityQuestion}</p>
                        <label htmlFor="securityAnswer" className="block mb-2">Security Answer</label>
                        <input
                            id='securityAnswer' 
                            type="text" 
                            className="w-full p-2 border rounded" 
                            value={securityAnswer} 
                            onChange={(e) => setSecurityAnswer(e.target.value)} 
                            required 
                        />
                        <button type="submit" className="w-full mt-4 bg-blue-500 text-white py-2 rounded">
                            Verify Answer
                        </button>
                    </form>
                )}

                {/* Step 3: Reset Password */}
                {step === 3 && (
                    <form onSubmit={handlePasswordReset}>
                        <label htmlFor='newPassword' className="block mb-2">New Password</label>
                        <input 
                            id='newPassword'
                            type="password" 
                            className="w-full p-2 border rounded" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                        />
                        <label htmlFor='confirmPassword' className="block mb-2 mt-4">Confirm Password</label>
                        <input 
                            id='confirmPassword'
                            type="password" 
                            className="w-full p-2 border rounded" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                        />
                        <button type="submit" className="w-full mt-4 bg-green-500 text-white py-2 rounded">
                            Reset Password
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
