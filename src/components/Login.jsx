import React, { useState } from 'react';

export default function Login({ initialToken = '', onSubmit }) {
  const [token, setToken] = useState(initialToken);

  return (
    <div className='card animate-in'>
      <div className='card-inner'>
        <h2 className='card-title'>Supplier Token</h2>
        <div className='small'>Paste your supplier token to access granted channels.</div>

        <div style={{ height: 12 }} />

        <div className='label'>Token</div>
        <div style={{ height: 6 }} />
        <input
          className='input'
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder='sp_123_xxxxxxxxxx'
          autoCapitalize='none'
          autoCorrect='off'
          spellCheck={false}
        />

        <div style={{ height: 12 }} />

        <div className='row row-spread'>
          <button className='btn btn-primary' onClick={() => onSubmit(token)}>
            Continue
          </button>
          <span className='small'>Token is stored in localStorage.</span>
        </div>
      </div>
    </div>
  );
}
