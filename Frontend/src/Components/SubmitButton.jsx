import React from 'react';

function SubmitButton({ loading, text ,elseText}) {
  return (
    <button type="submit" disabled={loading}>
      {loading ? elseText : text}
    </button>
  );
}

export default SubmitButton;

