import React from 'react';

const ProfilePage = () => {
  // Dummy data
  const userData = {
    profile: {
      name: 'Sam Wilson',
      role: 'Captain America',
      email: 'sam.wilson@avengers.org',
      avatar: 'https://via.placeholder.com/150',
    },
    paymentHistory: {
      total: 25000,
      transactions: [
        { id: 1, date: '2025-07-20', type: 'Sent', amount: 5000, counterparty: 'Tony Stark', status: 'Completed' },
        { id: 2, date: '2025-07-15', type: 'Received', amount: 10000, counterparty: 'SHIELD', status: 'Completed' },
        { id: 3, date: '2025-07-10', type: 'Sent', amount: 3000, counterparty: 'Bucky Barnes', status: 'Pending' },
      ],
    },
    missions: {
      active: [
        {
          id: 1,
          title: 'Operation Nightfall',
          status: 'Ongoing',
          teammates: ['Bucky Barnes', 'Wanda Maximoff'],
        },
        {
          id: 2,
          title: 'Hydra Base Assault',
          status: 'Planned',
          teammates: ['Natasha Romanoff', 'Clint Barton'],
        },
      ],
    },
    teammates: [
      { id: 1, name: 'Bucky Barnes', role: 'Winter Soldier', avatar: 'https://via.placeholder.com/50' },
      { id: 2, name: 'Wanda Maximoff', role: 'Scarlet Witch', avatar: 'https://via.placeholder.com/50' },
      { id: 3, name: 'Clint Barton', role: 'Hawkeye', avatar: 'https://via.placeholder.com/50' },
    ],
    attendance: {
      percentage: 92,
    },
  };

  const { profile, paymentHistory, missions, teammates, attendance } = userData;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 flex items-center">
          <img
            src={profile.avatar}
            alt="Avatar"
            className="w-24 h-24 rounded-full mr-6"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
            <p className="text-gray-600">{profile.role}</p>
            <p className="text-gray-500">{profile.email}</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow-md rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Attendance</h2>
            <p className="text-2xl font-bold text-blue-600">{attendance.percentage}%</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Active Missions</h2>
            <p className="text-2xl font-bold text-blue-600">{missions.active.length}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Total Payments</h2>
            <p className="text-2xl font-bold text-blue-600">₹{paymentHistory.total.toLocaleString()}</p>
          </div>
        </div>

        {/* Missions Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Assigned Missions</h2>
          {missions.active.length === 0 ? (
            <p className="text-gray-500">No active missions assigned.</p>
          ) : (
            <div className="space-y-4">
              {missions.active.map((mission) => (
                <div key={mission.id} className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-700">{mission.title}</h3>
                  <p className="text-gray-600">Status: {mission.status}</p>
                  <p className="text-gray-600">Teammates: {mission.teammates.join(', ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment History Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 text-left text-gray-600">Date</th>
                  <th className="py-2 px-4 text-left text-gray-600">Type</th>
                  <th className="py-2 px-4 text-left text-gray-600">Amount</th>
                  <th className="py-2 px-4 text-left text-gray-600">From/To</th>
                  <th className="py-2 px-4 text-left text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.transactions.map((tx) => (
                  <tr key={tx.id} className="border-t">
                    <td className="py-2 px-4 text-gray-700">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-2 px-4 text-gray-700">{tx.type}</td>
                    <td className="py-2 px-4 text-gray-700">₹{tx.amount.toLocaleString()}</td>
                    <td className="py-2 px-4 text-gray-700">{tx.counterparty}</td>
                    <td className="py-2 px-4 text-gray-700">{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teammates Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Teammates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {teammates.map((teammate) => (
              <div key={teammate.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <img
                  src={teammate.avatar}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="text-gray-700 font-semibold">{teammate.name}</p>
                  <p className="text-gray-500 text-sm">{teammate.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Calendar */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Attendance History</h2>
          <div className="border rounded-lg p-4">
            <p className="text-gray-600">Interactive calendar showing attendance history (to be implemented).</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;