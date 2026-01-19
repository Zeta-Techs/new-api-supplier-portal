import React, { useEffect } from 'react';

export default function Toast({ id, title, message, onClose, ttl = 3000 }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(id), ttl);
    return () => clearTimeout(t);
  }, [id, onClose, ttl]);

  return (
    <div className='toast animate-in'>
      <div className='toast-title'>{title}</div>
      {message ? <div className='toast-body'>{message}</div> : null}
    </div>
  );
}
