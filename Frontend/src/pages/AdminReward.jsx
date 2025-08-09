import React, { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';

const AdminRewardPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosClient.get('/mission/adminpayment');
        setPayments(response.data || []);
      } catch (err) {
        console.error('Failed to fetch admin payments:', err);
        setError('Failed to load payment history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <AdminNavbar />

      <main className="flex-grow container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Payment History</h1>

        {loading && <p className="text-center text-gray-400">Loading payment history...</p>}

        {error && <p className="text-center text-red-500 mb-4">{error}</p>}

        {!loading && !error && payments.length === 0 && (
          <p className="text-center text-gray-400">No payments found.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {!loading &&
            payments.map((payment) => (
              <div
                key={payment.paymentId}
                className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:shadow-blue-500/50 transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2 truncate" title={`Payment ID: ${payment.paymentId}`}>
                  Payment ID: <span className="font-mono">{payment.paymentId}</span>
                </h2>

                <div className="mb-2">
                  <span className="font-semibold">User:</span>{' '}
                  <span>{payment.userName || 'N/A'}</span>
                  <br />
                  <span className="text-sm text-gray-400">{payment.userEmail}</span>
                </div>

                <div className="mb-2">
                  <span className="font-semibold">Mission:</span>{' '}
                  <span>{payment.missionTitle || 'N/A'}</span>
                </div>

                <div className="mb-2">
                  <span className="font-semibold">Amount:</span>{' '}
                  <span className="text-green-400">₹{payment.amount?.toFixed(2) || '0.00'}</span>
                </div>

                <div className="mb-2">
                  <span className="font-semibold">Date:</span>{' '}
                  <time dateTime={payment.paidAt}>
                    {new Date(payment.paidAt).toLocaleString()}
                  </time>
                </div>

                <div className="mb-2">
                  <span className="font-semibold">Status:</span>{' '}
                  <span
                    className={
                      payment.status?.toLowerCase() === 'completed'
                        ? 'text-green-500'
                        : payment.status?.toLowerCase() === 'pending'
                        ? 'text-yellow-400'
                        : 'text-red-500'
                    }
                  >
                    {payment.status || 'N/A'}
                  </span>
                </div>

                <div className="mt-4 text-sm text-gray-400">
                  <span className="font-semibold">Payment Intent ID:</span>{' '}
                  <span className="break-all">{payment.paymentIntentId || 'N/A'}</span>
                </div>
              </div>
            ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminRewardPage;
