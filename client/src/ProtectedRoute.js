import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

const ProtectedRoute = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkTokenExpiration = () => {
            const token = localStorage.getItem('token');
            const verificationTime = localStorage.getItem('verificationTime');
            const currentTime = Date.now();
            const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
            const twoMinutes= 2*60*1000;
            if (token && verificationTime) {
                if (currentTime - verificationTime > twoMinutes) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('verificationTime');
                    alert('Your session has expired. Please log in again.');
                    navigate('/login'); // Redirect to login page
                }
            }
        };

        const interval = setInterval(checkTokenExpiration, 1000); // Check every second

        return () => clearInterval(interval); // Cleanup the interval on component unmount
    }, [navigate]);

    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
