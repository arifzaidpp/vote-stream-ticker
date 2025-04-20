// // test-websocket.ts
// import { io, Socket } from 'socket.io-client';
// import * as jwt from 'jsonwebtoken';

// // Configuration
// const WS_URL = 'http://localhost:3000'; // Update with your NestJS server URL
// const JWT_SECRET = 'your-jwt-secret'; // Use the same secret as in your app

// // Mock data for testing
// const electionId = '123e4567-e89b-12d3-a456-426614174000';
// const boothId = '123e4567-e89b-12d3-a456-426614174001';
// const testVoteCount = {
//   electionId,
//   boothId,
//   roundNumber: 1,
//   results: [
//     { candidateId: '123e4567-e89b-12d3-a456-426614174002', voteCount: 150 },
//     { candidateId: '123e4567-e89b-12d3-a456-426614174003', voteCount: 200 },
//   ],
// };

// // Generate a JWT token for authentication
// function generateToken(userId: string, role: string): string {
//   return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: '1h' });
// }

// // Create a socket client with authentication
// function createAuthenticatedClient(): Socket {
//   const token = generateToken('test-user-id', 'admin');
  
//   return io(WS_URL, {
//     extraHeaders: {
//       Authorization: `Bearer ${token}`,
//     },
//     autoConnect: false,
//   });
// }

// // Main test function
// async function runTests() {
//   console.log('🚀 Starting WebSocket tests...');
  
//   const socket = createAuthenticatedClient();
  
//   // Set up event listeners before connecting
//   socket.on('connect', () => {
//     console.log('✅ Connected to WebSocket server');
    
//     // Test 1: Join election room
//     console.log('🔍 Test 1: Joining election room...');
//     socket.emit('joinElectionRoom', { electionId }, (response) => {
//       console.log('Response from joinElectionRoom:', response);
//     });
//   });
  
//   socket.on('electionData', (data) => {
//     console.log('✅ Received election data:', JSON.stringify(data, null, 2));
    
//     // Test 2: Submit vote count
//     console.log('🔍 Test 2: Submitting vote count...');
//     socket.emit('submitVoteCount', testVoteCount, (response) => {
//       console.log('Response from submitVoteCount:', response);
      
//       if (response?.success && response?.result?.id) {
//         // Test 3: Publish counting round
//         console.log('🔍 Test 3: Publishing counting round...');
//         socket.emit('publishCountingRound', 
//           { 
//             roundId: response.result.id, 
//             electionId 
//           }, 
//           (publishResponse) => {
//             console.log('Response from publishCountingRound:', publishResponse);
//             console.log('✅ All tests completed, closing connection');
//             socket.disconnect();
//           }
//         );
//       } else {
//         console.log('❌ Failed to submit vote count, skipping further tests');
//         socket.disconnect();
//       }
//     });
//   });
  
//   socket.on('voteCountUpdated', (data) => {
//     console.log('✅ Received vote count update:', data);
//   });
  
//   socket.on('roundPublished', (data) => {
//     console.log('✅ Received round published event:', data);
//   });
  
//   socket.on('countingError', (error) => {
//     console.log('❌ Error from server:', error);
//   });
  
//   socket.on('disconnect', () => {
//     console.log('❌ Disconnected from WebSocket server');
//   });
  
//   socket.on('error', (error) => {
//     console.log('❌ Socket error:', error);
//   });
  
//   // Connect to the server
//   socket.connect();
  
//   // Add a timeout to disconnect if tests run too long
//   setTimeout(() => {
//     if (socket.connected) {
//       console.log('⚠️ Test timeout reached, disconnecting');
//       socket.disconnect();
//     }
//   }, 10000);
// }

// // Run the tests
// runTests().catch(console.error);