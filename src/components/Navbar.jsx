import { Link } from "react-router-dom";
import plantcareImage from '../images/plantcare.png';

const Navbar = () => {
  return (
    <nav className=" text-green-900 p-2 flex items-center gap-6 shadow-md">
      {/* Logo dan Nama Aplikasi */}
      <Link to="/dashboard" className="flex items-center gap-2 ml-4">
        <img src={plantcareImage} alt="PlantCare Logo" className="w-12 h-12" />
        <span className="font-bold text-lg">PlantCare</span>
      </Link>

      {/* Navigasi Menu */}
      <Link to="/dashboard" className="hover:underline">
        Dashboard
      </Link>
      <Link to="/tanaman" className="hover:underline">
        Tanaman
      </Link>
      <Link to="/jadwal" className="hover:underline">
        Jadwal
      </Link>

      <div className="ml-auto mr-8">
        <Link to="/login" className="hover:underline">
          Logout
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
