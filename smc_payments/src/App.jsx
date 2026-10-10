import React, { useState } from 'react';
import CitizenPayment from './pages/CitizenPayment/CitizenPayment';
import AdminPayment from './pages/AdminPayment/AdminPayment';

function App() {
  const [view, setView] = useState('citizen');

  return (
    <div>
      <div style={{ padding: '10px', background: '#333', color: 'white', textAlign: 'center' }}>
        <button onClick={() => setView('citizen')} style={{ margin: '0 10px', padding: '5px 15px', cursor: 'pointer' }}>View Citizen UI</button>
        <button onClick={() => setView('admin')} style={{ margin: '0 10px', padding: '5px 15px', cursor: 'pointer' }}>View Admin UI</button>
      </div>

      {view === 'citizen' ? <CitizenPayment /> : <AdminPayment />}
    </div>
  );
}

export default App;