import React from 'react';

function Placeholder({ title }) {
  return (
    <div className="placeholder-container">
      <div className="placeholder-content">
        <div className="icon">🚧</div>
        <h2>{title}</h2>
        <p>This feature is currently under development.</p>
        <p>Check back soon for updates!</p>
      </div>
    </div>
  );
}

export default Placeholder;
