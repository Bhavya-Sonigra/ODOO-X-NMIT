import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import CryptoService from '../../services/encryptDecryptService.js';
import ApiService from '../../services/apiService.js';
import { useToast } from './ToastService'

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState({});
    const [generatedOTP, setGeneratedOTP] = useState('');
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [showPopup, setShowPopup] = useState(false);
    const [otpMatch, setOtpMatch] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { notifySuccess, notifyError } = useToast();
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState({});
    const [token, setToken] = useState(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const userData=JSON.parse(localStorage.getItem('userData'));


    const handleSignUp = async (event) => {
        event.preventDefault();
        const newErrors = {};
        if (!name) {
            newErrors.name = "Name is required";
        }
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Invalid email address';
        }
        if (!password) {
            newErrors.password = 'Invalid Password';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }
        if (!phoneNumber) {
            newErrors.phoneNumber = 'Phone number required';
        } else if (phoneNumber.length < 10) {
            newErrors.phoneNumber = 'Phone number must be 10 digits';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        try {
            const response = await fetch(ApiService.auth.sendOTP(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });
            const otpRes = await response.json();
            if (response.ok) {
                setGeneratedOTP(otpRes.otp);
                setShowPopup(true);
                }
                else{
                    notifyError(otpRes.message);
                }
          
        } catch (err) {
            // console.error(err);
            notifyError("Something went wrong");

        }
    };

    const verifyOtp = async (event) => {
        event.preventDefault();

        const otpString = otp.join('');
        if (otp.some((digit) => digit === '')) {
            setErrors({ otp: 'Incorrect OTP!' });
            return;
        }
        if (otpString === generatedOTP) {
            setOtpMatch(true);
            setShowPopup(false);
            setOtp(new Array(6).fill(''));
         
            const userData = { name, email, phoneNumber, profile: '', password, isGoogleRegister: false };
            handleUserSignUpAuth(userData);
        } else {
            setErrors({ otp: 'OTP does not match' });
        }
    };



    const handleGoogleSignUp = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            setIsLoading(true);
            try {
                // Get user info from Google
                const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${codeResponse.access_token}`,
                        Accept: 'application/json',
                    },
                });

                if (response.ok) {
                    const userInfo = await response.json();
                    
                    // Send to backend for registration with Google ID token
                    const backendResponse = await fetch(ApiService.auth.googleRegister(), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            tokenId: userInfo.id, // Using Google ID as token
                            phoneNumber: phoneNumber || ''
                        }),
                    });

                    if (backendResponse.ok) {
                        const data = await backendResponse.json();
                        if (data.success && data.userData) {
                            setIsLoading(false);
                            notifySuccess('Signed Up successfully!');
                            const encryptedUserData = CryptoService.encryptData(data.userData);
                            localStorage.setItem('userData', JSON.stringify(encryptedUserData));
                            if (data.token) {
                                localStorage.setItem('authToken', data.token);
                                setToken(data.token);
                            }
                            setAuthenticated(true);
                        }
                    } else {
                        const errorData = await backendResponse.json();
                        setIsLoading(false);
                        notifyError(errorData.msg || 'Google registration failed');
                    }
                } else {
                    setIsLoading(false);
                    notifyError('Failed to fetch user info from Google');
                }
            } catch (err) {
                setIsLoading(false);
                console.error('Error during Google registration:', err);
                notifyError('Google registration failed');
            }
        },
        onError: (error) => {
            setIsLoading(false);
            console.error('Google login error:', error);
            notifyError('Google authentication failed');
        },
    });

    const handleUserSignUpAuth = async (userData) => {
        setIsLoading(true);
        if (!userData.name || !userData.email || !userData.password) {
            setIsLoading(false);
            return { success: false, message: 'Missing required user data' };
        }

        try {
            const response = await fetch(ApiService.auth.register(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.msg === 'success' && data.userData) {
                    setIsLoading(false);
                    notifySuccess('Signed Up successfully!');
                    const encryptedUserData=CryptoService.encryptData(data.userData);
                    localStorage.setItem('userData', JSON.stringify(encryptedUserData));
                    if (data.token) {
                        localStorage.setItem('authToken', data.token);
                        setToken(data.token);
                    }
                    setAuthenticated(true);
                }
                return { success: true, data };
            } else {
                const errorData = await response.json();
                notifyError(errorData.msg);
                throw new Error(`Error: ${errorData.msg || 'Network response was not ok'}`);
            }
        } catch (error) {
            notifyError(error.msg);
            return { success: false, message: error.message };
        } finally {
            setIsLoading(false);
        }
    };


    // sign...

    const handleSignIn = (event) => {
        event.preventDefault();

        const newErrors = {};
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Invalid email address';
        }
        if (!password) {
            newErrors.password = 'Invalid Password';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        const uData = {
            email,
            password,
            isGoogleLogin: false
        };
        handleUserSignInAuth(uData);

        setErrors({});

    };


    const handleGoogleSignIn = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            setIsLoading(true);
            try {
                // Get user info from Google
                const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${codeResponse.access_token}`,
                        Accept: 'application/json'
                    }
                });

                if (response.ok) {
                    const userInfo = await response.json();

                    // Send to backend for login with Google ID token
                    const backendResponse = await fetch(ApiService.auth.googleLogin(), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            tokenId: userInfo.id // Using Google ID as token
                        }),
                    });

                    if (backendResponse.ok) {
                        const data = await backendResponse.json();
                        if (data.success && data.userData) {
                            setIsLoading(false);
                            notifySuccess('Signed In Successfully');
                            const encryptedUserData = CryptoService.encryptData(data.userData);
                            localStorage.setItem('userData', JSON.stringify(encryptedUserData));
                            if (data.token) {
                                localStorage.setItem('authToken', data.token);
                                setToken(data.token);
                            }
                            setAuthenticated(true);
                        }
                    } else {
                        const errorData = await backendResponse.json();
                        setIsLoading(false);
                        notifyError(errorData.msg || 'Google login failed');
                    }
                } else {
                    setIsLoading(false);
                    notifyError('Failed to fetch user info from Google');
                }
            } catch (err) {
                setIsLoading(false);
                console.error('Error during Google login:', err);
                notifyError('Google login failed');
            }
        },
        onError: (error) => {
            setIsLoading(false);
            console.error('Google login error:', error);
            notifyError('Google authentication failed');
        }
    });


    const handleUserSignInAuth = async (uData) => {
        setIsLoading(true)
        if (uData.email && uData.password) {
            try {
                const response = await fetch(ApiService.auth.login(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(uData),
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.userData) {
                            setIsLoading(false)
                            notifySuccess('Signed In Successfully');
                            const encryptedUserData=CryptoService.encryptData(data.userData);
                            localStorage.setItem('userData', JSON.stringify(encryptedUserData));
                            if (data.token) {
                                localStorage.setItem('authToken', data.token);
                                setToken(data.token);
                            }
                            setAuthenticated(true);
                    }
                }
                else {
                    setIsLoading(false)
                    const errorData = await response.json();
                    throw new Error(`Error: ${errorData.msg || 'Network response was not ok'}`);
                }
            } catch (error) {
                setIsLoading(false)
                notifyError(error.message);
              
            }
        } else {
            setIsLoading(false)
            console.log('Missing required user data');
          
        }
    };

   

        useEffect(() => {
            if(userData){
                const decryptedUserData=CryptoService.decryptData(userData);
                setUser(decryptedUserData);
                setAuthenticated(true);
            }
            const savedToken = localStorage.getItem('authToken');
            if (savedToken) {
                setToken(savedToken);
            }
        },[userData]);




    return (
        <AuthContext.Provider
            value={{
                email,
                setEmail,
                phoneNumber,
                setPhoneNumber,
                password,
                setPassword,
                name,
                setName,
                generatedOTP,
                otp,
                setOtp,
                showPopup,
                otpMatch,
                isLoading,
                verifyOtp,
                handleGoogleSignUp,
                handleGoogleSignIn,
                handleSignIn,
                handleSignUp,
                errors,
                isAuthenticated,
                setAuthenticated,
                user,
                setUser,
                token,
                setToken
               


            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
