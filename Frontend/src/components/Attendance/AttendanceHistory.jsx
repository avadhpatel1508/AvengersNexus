import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AttendanceHistory = ({ userId }) => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:4000/attendance/user/${userId}`, { withCredentials: true })
      .then(res => setRecords(res.data.attendance))
      .catch(err => console.log(err));
  }, [userId]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Attendance History</h2>
      <ul className="list-disc ml-5">
        {records.map((r, idx) => (
          <li key={idx}>
            {r.date.split('T')[0]} — <span className={r.status === 'Present' ? 'text-green-600' : 'text-red-600'}>{r.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttendanceHistory;
