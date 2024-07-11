import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Allianz_logo.jpg";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center bg-white-400 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-blue-500 mt-2 py-4 bg-gray-200 w-full shadow-md rounded-t-lg">
        Welcome to Allianz
      </h1>
      <div className="flex flex-col items-center justify-center mt-2">
        <img
          src={logo}
          alt="Your Logo"
          className="h-2/3 mb-8 rounded-lg mt-32"
        />
        <div className="flex flex-row justify-between space-x-16 mt-0">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-2xl shadow-gray-600 transition duration-300 ease-in-out w-36"
            onClick={() => navigate("/visitor")}
          >
            VISITOR
          </button>

          {/* Contractor button */}
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl shadow-gray-600 transition duration-300 ease-in-out w-36"
            onClick={() => navigate("/contractor")}
          >
            CONTRACTOR
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
