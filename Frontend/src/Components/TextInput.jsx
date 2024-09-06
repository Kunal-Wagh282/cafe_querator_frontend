import React from 'react';

function TextInput({ label, value, onChange, id,type,message }) {
  return (
    <div>
      <label htmlFor={id}></label>
      <input
        type={type}
        id={id}
        onChange={onChange}
        placeholder={message}
        required
      />
    </div>
  );
}

export default TextInput;
