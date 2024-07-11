import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";


const VisitorForm = () => {
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    visiting: "",
    date: "",
    timeIn: "",
  });

  const [showModal, setShowModal] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [filter, setFilter] = useState({
    fromDate: getCurrentDate(),
    toDate: getCurrentDate(),
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    filterVisitor();
  }, []);

  const filterVisitor = async () => {
    try {
      let url = `https://allianz-d4kg.onrender.com/api/visitor`;

      if (filter.fromDate && filter.toDate) {
        if (new Date(filter.fromDate) > new Date(filter.toDate)) {
          toast.error("Invalid Date Request");
          return;
        }

        const response = await axios.get(url);
        const filterData = response.data.filter((visitor) => {
          const visitorDate = new Date(visitor.date);
          return (
            visitorDate >= new Date(filter.fromDate) &&
            visitorDate <= new Date(filter.toDate)
          );
        });

        setVisitors(filterData);
      } else {
        fetchVisitors();
      }
    } catch (error) {
      console.error("Error fetching visitors:", error);
    }
  };

  const fetchVisitors = async () => {
    try {
      let url = `https://allianz-d4kg.onrender.com/api/visitor`;
      const response = await axios.get(url);

      if (response) setVisitors(response.data);
    } catch (error) {
      console.error("Error fetching visitors:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleClearFilter = () => {
    setFilter({
      fromDate: "",
      toDate: "",
    });
    fetchVisitors();
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `https://allianz-d4kg.onrender.com/api/visitor`,
        formData
      );
      toast.success("Visitor form submitted successfully!");

      setVisitors([response.data, ...visitors]);
      setFormData({
        name: "",
        company: "",
        visiting: "",
        date: "",
        timeIn: "",
      });

      setShowModal(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const filteredVisitors = visitors.filter((visitor) => {
    return (
      visitor.name.toLowerCase().includes(search.toLowerCase()) ||
      visitor.company.toLowerCase().includes(search.toLowerCase()) ||
      visitor.visiting.toLowerCase().includes(search.toLowerCase()) ||
      visitor.date.includes(search)
    );
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Visitor Data", 20, 10);

    const tableColumn = [
      "S. No.",
      "Name",
      "Company",
      "Visiting",
      "Date",
      "Time In",
    ];
    const tableRows = [];

    filteredVisitors.forEach((visitor, index) => {
      const visitorData = [
        index + 1,
        visitor.name,
        visitor.company,
        visitor.visiting,
        visitor.date,
        visitor.timeIn,
      ];
      tableRows.push(visitorData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save("visitors.pdf");
  };

  return (
    <div className="bg-cyan-100 flex flex-col items-center justify-center min-h-screen pt-4">
      <Link
        to="/"
        className="bg-blue-500 text-white px-6 py-3 mb-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200"
      >
        Home
      </Link>
      <div className="bg-gradient-to-l from-blue-300 to-green-300 p-6 mt-0 rounded-lg shadow-md w-11/12 lg:w-9/12 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-sky-500 font-bold">Filter Visitors</h2>
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200"
            onClick={() => setShowModal(true)}
          >
            New Visitor
          </button>
        </div>
        <div className="flex space-x-4 mb-4">
          <p className="text-red-400 font-bold text-xl">From:</p>
          <input
            type="date"
            name="fromDate"
            value={filter.fromDate}
            onChange={handleFilterChange}
            className="border rounded-lg px-4 py-2"
          />
          <p className="text-red-400 text-xl font-bold">To:</p>
          <input
            type="date"
            name="toDate"
            value={filter.toDate}
            onChange={handleFilterChange}
            className="border rounded-lg px-4 py-2"
          />
          <button
            onClick={filterVisitor}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200"
          >
            Apply Filter
          </button>
          <button
            onClick={handleClearFilter}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg shadow-lg hover:bg-gray-400 transition duration-200"
          >
            Clear Filter
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, Company, or visiting"
            value={search}
            onChange={handleSearchChange}
            className="border rounded-lg px-4 py-2 w-full"
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-sky-500 font-bold">Previous Visitors</h2>
          <button
            onClick={generatePDF}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200"
          >
            Download PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  S. No.
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Visiting
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Time In
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredVisitors.map((visitor, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {visitor.name}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {visitor.company}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {visitor.visiting}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {visitor.date}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {visitor.timeIn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-gradient-to-r from-blue-100 to-blue-300 p-6 rounded-lg shadow-md w-full max-w-lg h-[90vh]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl text-blue-800 font-bold">Visitor Form</h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-red-500 text-3xl font-bold focus:outline-none"
            >
              &times;
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Visitor Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Visiting
              </label>
              <input
                type="text"
                name="visiting"
                value={formData.visiting}
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Time In
              </label>
              <input
                type="time"
                name="timeIn"
                value={formData.timeIn}
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200"
            >
              Submit
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default VisitorForm;
