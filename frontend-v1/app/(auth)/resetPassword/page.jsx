'use client';
import React, { useState, useEffect, Suspense } from 'react'; // Add Suspense import
import { useRouter, useSearchParams } from 'next/navigation';

import { Input } from 'antd'; 
import { N } from '@/app/utils/notificationService';
import Link from 'next/link';
import axiosInstance from '@/app/api/axios';

const PasswordReset = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const qtoken = searchParams.get("token");

  const resetPassword = async () => {
    setLoading(true);
    if (password !== cPassword) {
        N("Password Mismatch", 'Confirm Password is not matched.', "error");
        setLoading(false);
        return;
    }

    try {
      const response = await axiosInstance.post('/api/resetPassword', {
        token,
        password,
      });

      if (response && response.status === 200) {
        N("Success", response.data.message, "success");
        router.push('/login');
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      N("Failed to reset password", 'Something went wrong. Please try again.', "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!qtoken) {
        N("Error", "Token not found.", "error");
        router.push('/login');
      } else {
        setToken(qtoken);
      }
    }
    fetchData();
  }, [qtoken, router]);

  return (
    <div className="d-flex flex-column flex-root">
      <div
        className="d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed"
        style={{ backgroundImage: 'url(assets/media/illustrations/sketchy-1/14.png)' }}
      >
        <div className="d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20">
          <Link href="/login" className="mb-12">
            <img alt="Logo" src="/assets/media/logos/logo.png" className="h-100px" />
          </Link>
          <div className="w-lg-500px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto">
            <form className="form w-100" noValidate>
              <div className="text-center mb-10">
                <h1 className="text-dark mb-3">Reset Password</h1>
                <div className="text-gray-400 fw-bold fs-4">Enter your new password.</div>
              </div>

              <div className="fv-row mb-10">
                <label className="form-label fw-bolder text-gray-900 fs-6">Password</label>
                <Input.Password
                  className='pt-3 pb-3 bg-slate-100 border'
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="fv-row mb-10">
                <label className="form-label fw-bolder text-gray-900 fs-6">Confirm Password</label>
                <Input.Password
                  className='pt-3 pb-3 bg-slate-100 border'
                  placeholder="Confirm Password"
                  value={cPassword}
                  onChange={(e) => setCPassword(e.target.value)}
                />
              </div>

              <div className="d-flex flex-wrap justify-content-center pb-lg-0">
                <button
                  onClick={resetPassword}
                  type="button"
                  className="btn btn-lg btn-primary fw-bolder me-4"
                >
                  <span className={loading ? 'indicator-label' : ''}>
                    {loading ? (
                      <>
                        Please wait...
                        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                      </>
                    ) : (
                      'Submit'
                    )}
                  </span>
                </button>
                <Link href="/login" className="btn btn-lg btn-light-primary fw-bolder">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuspenseWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PasswordReset />
  </Suspense>
);

export default SuspenseWrapper;
