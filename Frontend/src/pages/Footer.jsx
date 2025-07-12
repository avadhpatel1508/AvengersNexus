import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-4">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <div className="text-2xl font-bold mb-2">The Programming Club</div>
          <div className="text-sm">Powered by PC Club, Ahmedabad University</div>
          <div className="text-sm">© 2025 All rights reserved.</div>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-cyan-400">Home</a>
          <a href="#" className="hover:text-cyan-400">Events</a>
          <a href="#" className="hover:text-cyan-400">Analytics</a>
          <a href="#" className="hover:text-cyan-400">Gallery</a>
          <a href="#" className="hover:text-cyan-400">Our Team</a>
          <a href="#" className="hover:text-cyan-400">Contact Us</a>
          <a href="#" className="hover:text-cyan-400">GitHub</a>
          <a href="#" className="hover:text-cyan-400">LinkTree</a>
        </div>
        <span class="border border-gray-400 text-gray-400 rounded-xl px-4 py-2 text-sm cursor-not-allowed flex justify-center">Completed</span>
      </div>
       <div className="dEQgpI">
      <div className="inner relative inline-block px-4 py-2 text-white bg-blue-600 rounded-xl cursor-pointer hover:bg-blue-700 transition-colors">
        Click Me
      </div>
    </div>
    </footer>
  );
};

export default Footer;