import { NavLink } from "react-router-dom";

function Navbar({ user, handleLogout }) {
    return (
        <nav className="bg-[#0A2342] text-white px-8 py-4 shadow-md flex justify-between items-center">
            <div className="text-2xl font-bold tracking-wide">AvengersNexus</div>

            <div className="flex items-center gap-6 text-base">
                <NavLink to="/posts" className="hover:text-[#E63946] transition">Posts</NavLink>
                <NavLink to="/missions" className="hover:text-[#E63946] transition">Missions</NavLink>
                <NavLink to="/attendance" className="hover:text-[#E63946] transition">Attendance</NavLink>
                <NavLink to="/contact-admin" className="hover:text-[#E63946] transition">Contact Admin</NavLink>

                <div className="relative group">
                    <div className="cursor-pointer hover:text-[#E63946]">
                        {user?.firstName || 'Guest'}
                    </div>
                    <ul className="absolute right-0 mt-2 bg-white text-gray-700 rounded-md shadow-lg py-2 opacity-0 group-hover:opacity-100 transition duration-300 z-10 w-44">
                        <li><NavLink to="/your-reward" className="block px-4 py-2 hover:bg-gray-100">Your Reward</NavLink></li>
                        <li><NavLink to="/attendance-summary" className="block px-4 py-2 hover:bg-gray-100">Attendance</NavLink></li>
                        <li><NavLink to="/your-missions" className="block px-4 py-2 hover:bg-gray-100">Your Missions</NavLink></li>

                        <li><button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button></li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
