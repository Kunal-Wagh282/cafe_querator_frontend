import React, { useEffect, useState } from 'react';

const Socket = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt'); // Retrieve JWT token from localStorage
    console.log(jwt)
    const ws = new WebSocket(`ws://cafequerator-backend.onrender.com/ws/queue/?jwt=${jwt}`);

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, data.message]);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket) {
      socket.send(JSON.stringify({ message: 'Hello from React!' }));
    }
  };

  return (
    <div>
      <h1>WebSocket Example</h1>
      <button onClick={sendMessage}>Send Message</button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default Socket;