import React, { useEffect, useState ,useRef} from 'react';

const Socket = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null); // Use ref to hold the WebSocket instance

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const jwt = localStorage.getItem('jwt'); // Retrieve JWT token from localStorage
      console.log('JWT Token:', jwt);

      if (!jwt) {
        console.error('JWT token not found!');
        return; // Handle this case accordingly (e.g., redirect to login)
      }

      const ws = new WebSocket(`wss://cafequerator-backend.onrender.com/ws/queue/?jwt=${jwt}`);

      ws.onopen = () => {
        console.log('WebSocket connection established');
      };

      ws.onmessage = (event) => {
        //const data = JSON.parse(event.data);
        console.log(event.data)
        if (event.data === 'queue updated') {
          
          fetchQueue();
  
        }
        if (event.data === 'current track updated') {
          //fetchQueue();
        }
      };

      ws.onclose = (event) => {
        console.warn('WebSocket connection closed:', event);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.log('Retrying connection...');
        setTimeout(() => {
          const newWs = new WebSocket(`wss://cafequerator-backend.onrender.com/ws/queue/?jwt=${jwt}`);
          setSocket(newWs);
        }, 5000); // Retry after 5 seconds
      };

      setSocket(ws);

      // Cleanup on component unmount
      return () => {
        ws.close();
      };
    }, 5000); // Delay of 5 seconds

    // Cleanup the timeout if the component unmounts before the timeout completes
    return () => clearTimeout(timeoutId);
  }, []);

  const sendMessage = () => {
    if (socket) {
      socket.send(JSON.stringify({ message: 'Hello from React!' }));
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${CONFIG.API_URL}/logout`, {}); // Make logout API call

      if (socketRef.current) {
        socketRef.current.close(); // Close WebSocket connection
        socketRef.current = null; // Reset the WebSocket reference
        console.log('WebSocket connection closed during logout');
      }

    } catch (error) {
      console.error('Failed to log out. Please try again.',error);
    }
  };

  return (
    <div>
      <h1>WebSocket Example</h1>
      <button onClick={handleLogout}>Send Message</button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default Socket;
