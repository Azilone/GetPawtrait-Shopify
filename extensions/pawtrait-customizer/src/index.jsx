import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">Pawtrait Customizer</h1>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('pawtrait-root'));
root.render(<App />);
