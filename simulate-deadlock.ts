import axios from 'axios';

async function simulateDeadlock() {
  const payload1 = {
    orderItems: [
      { productId: 1, quantity: 1 },
      { productId: 2, quantity: 1 },
    ],
  };

  const payload2 = {
    orderItems: [
      { productId: 2, quantity: 1 },
      { productId: 1, quantity: 1 },
    ],
  };

  await Promise.allSettled([
    axios.post('http://localhost:3000/order', payload1, {
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUwNDA5MjQ4LCJleHAiOjE3NTA0MTI4NDh9.zRO4MqFyKXBES7eWEsW04abWylp6d85HCj90e5A5tZM',
      },
    }),
    axios.post('http://localhost:3000/order', payload2, {
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJib2IiLCJlbWFpbCI6ImJvYkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1MDQwOTMwMCwiZXhwIjoxNzUwNDEyOTAwfQ.nYwrhI9q5HhNob1hbx42msYxNz14h4xbCMIafW__GuU',
      },
    }),
  ]);
}

simulateDeadlock().catch(console.error);
