import React, { useEffect, useState } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatBox from '../components/ChatBox';
import { initializeSocket, getSocket } from '../socket/socket';
import { useSelector } from 'react-redux';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    const socketInstance = initializeSocket(); // Creates and authenticates socket
    setSocket(socketInstance);

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, []);

  // Join the mission room when a chat is selected
  useEffect(() => {
    if (socket && selectedChat?._id) {
      socket.emit('joinMissionRoom', selectedChat._id);
    }
  }, [socket, selectedChat]);

  if (!user) {
    return (
      <div className="text-center text-white py-10">
        🔒 Please login to access the chat.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <ChatSidebar
        user={user}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />
      <ChatBox
        socket={socket}
        selectedChat={selectedChat}
        user={user}
      />
    </div>
  );
};

export default ChatPage;
