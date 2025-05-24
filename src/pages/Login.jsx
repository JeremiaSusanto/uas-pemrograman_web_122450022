import plantcareImage from '../images/plantcare.png';
const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <img
          src={plantcareImage} // Ganti dengan URL logo Anda
            alt="Logo PlantCare"
            className="w-24 h-24 mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold mb-6 text-center text-green-800">Login ke PlantCare</h2>
        
        <form>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Masukkan username"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
