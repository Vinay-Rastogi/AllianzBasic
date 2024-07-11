import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import Modal from "react-modal";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ContractorForm = () => {
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const [formData, setFormData] = useState({
    company: "",
    engineer: "",
    jobCallOut: "",
    action: "",
    date: "",
    timeIn: "",
    timeOut: "",
    phoneNumber: "",
    accessCardNo: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [contractors, setContractors] = useState([]);

  const [filter, setFilter] = useState({
    fromDate: getCurrentDate(),
    toDate: getCurrentDate(),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editContractorId, setEditContractorId] = useState(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    filterContractor();
  }, []);

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
    fetchContractors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneRegex = /^\d{9,15}$/;
    const accessCardRegex = /^[a-zA-Z0-9]{0,6}$/;

    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.warn("Phone number must be 9 to 15 digits.");
      return;
    }

    if (!accessCardRegex.test(formData.accessCardNo)) {
      toast.warn(
        "Access card number can have maximum 6 alphanu meric characters."
      );
      return;
    }

    try {
      if (isEditing) {
        // Update existing contractor if isEditing is true
        const response = await axios.put(
          `https://allianz-d4kg.onrender.com/api/contractor/${editContractorId}`,
          formData
        );
        toast.success("Contractor updated successfully!");
        // Update contractors state with updated data
        setContractors((prev) =>
          prev.map((contractor) =>
            contractor._id === editContractorId ? response.data : contractor
          )
        );
      } else {
        // Submit new contractor form if isEditing is false
        const response = await axios.post(
          `https://allianz-d4kg.onrender.com/api/contractor`,
          formData
        );
        toast.success("Contractor form submitted successfully!");
        // Add new contractor to the beginning of contractors array
        setContractors([response.data, ...contractors]);
      }

      // Clear form data and close modal after submission
      setFormData({
        company: "",
        engineer: "",
        jobCallOut: "",
        action: "",
        date: "",
        timeIn: "",
        timeOut: "",
        phoneNumber: "",
        accessCardNo: "",
      });
      setShowModal(false);
      setIsEditing(false);
      setEditContractorId(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleEdit = (contractor) => {
    setIsEditing(true);
    setEditContractorId(contractor._id);
    // Populate form fields with selected contractor data
    setFormData({
      company: contractor.company,
      engineer: contractor.engineer,
      jobCallOut: contractor.jobCallOut,
      action: contractor.action,
      date: contractor.date,
      timeIn: contractor.timeIn,
      timeOut: contractor.timeOut,
      phoneNumber: contractor.phoneNumber,
      accessCardNo: contractor.accessCardNo,
    });
    setShowModal(true); // Open modal for editing
  };

  const filterContractor = async () => {
    try {
      let url = `https://allianz-d4kg.onrender.com/api/contractor`;

      if (filter.fromDate && filter.toDate) {
        // Validate date range
        if (new Date(filter.fromDate) > new Date(filter.toDate)) {
          toast.warn("Invalid Date Request");
          return;
        }

        const response = await axios.get(url);
        const filterData = response.data.filter((contractor) => {
          const contractorDate = new Date(contractor.date);
          return (
            contractorDate >= new Date(filter.fromDate) &&
            contractorDate <= new Date(filter.toDate)
          );
        });

        setContractors(filterData);
      } else {
        // If fromDate or toDate is empty, fetch all contractors
        fetchContractors();
      }
    } catch (error) {
      console.error("Error fetching contractor:", error);
    }
  };

  const filteredContractor = contractors.filter((contractor) => {
    return (
      contractor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.engineer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.jobCallOut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.timeIn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.timeOut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.accessCardNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const fetchContractors = async () => {
    try {
      let url = `https://allianz-d4kg.onrender.com/api/contractor`;

      const response = await axios.get(url);

      if (response) setContractors(response.data);
    } catch (error) {
      console.error("Error fetching contractor:", error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Contractor Data", 0, 10);

    const tableColumn = [
      "S. No.",
      "Engineer",
      "Company",
      "Job Callout",
      "Action",
      "Date",
      "Time In",
      "Time Out",
      "Phone No.",
      "Access Card No.",
    ];
    const tableRows = [];

    filteredContractor.forEach((contractor, index) => {
      const contractorData = [
        index + 1,
        contractor.engineer,
        contractor.company,
        contractor.jobCallOut,
        contractor.action,
        contractor.date,
        contractor.timeIn,
        contractor.timeOut,
        contractor.phoneNumber,
        contractor.accessCardNo,
      ];
      tableRows.push(contractorData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save("Contractor.pdf");
  };

  return (
    <div className="bg-cyan-100 flex flex-col items-center justify-center min-h-screen pt-4">
      <Link
        to="/"
        className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200"
      >
        Home
      </Link>
      <div className="bg-gradient-to-r from-purple-300 to-emerald-400 p-6 mt-6 rounded-lg shadow-md w-11/12 lg:w-5/6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-sky-500 font-bold">
            Filter Contractors
          </h2>
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200"
            onClick={() => {
              setIsEditing(false);
              setEditContractorId(null);
              setFormData({
                company: "",
                engineer: "",
                jobCallOut: "",
                action: "",
                date: "",
                timeIn: "",
                timeOut: "",
                phoneNumber: "",
                accessCardNo: "",
              });
              setShowModal(true);
            }}
          >
            New Contractor
          </button>
        </div>
        <div className="flex space-x-4 mb-4">
          <p className="text-red-400 font-bold text-xl">From :</p>
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
            onClick={filterContractor}
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
            placeholder="Search by Engineer, Company, ...."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border rounded-lg px-4 py-2 w-full"
          />
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-sky-500 font-bold">
            Previous Contractor
          </h2>
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
              <tr className="bg-gradient-to-r from-pink-400 to-emerald-500 text-white">
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  S. No.
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Engineer
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Job Call Out
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Time In
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Time Out
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Access Card No.
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredContractor.map((contractor, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {contractor.engineer}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {contractor.company}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {contractor.jobCallOut}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {contractor.action}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {contractor.date}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {contractor.timeIn}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {contractor.timeOut}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {contractor.phoneNumber}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {contractor.accessCardNo}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    <button
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-yellow-600 transition duration-200"
                      onClick={() => handleEdit(contractor)}
                    >
                      Edit
                    </button>
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
        className="fixed inset-0 flex items-center justify-center p-4 mt-4 overflow-y-auto rounded-xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-gradient-to-r from-blue-100 to-blue-300 p-6 pr-8 rounded-lg shadow-md w-full max-w-lg h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl text-blue-800 font-bold mt-6">
              Contractor Form
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-red-500 text-3xl font-bold focus:outline-none"
            >
              &times;
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700"
              >
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="engineer"
                className="block text-sm font-medium text-gray-700"
              >
                Engineer
              </label>
              <input
                type="text"
                name="engineer"
                value={formData.engineer}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="jobCallOut"
                className="block text-sm font-medium text-gray-700"
              >
                Job Call Out
              </label>
              <input
                type="text"
                name="jobCallOut"
                value={formData.jobCallOut}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="action"
                className="block text-sm font-medium text-gray-700"
              >
                Action
              </label>
              <input
                type="text"
                name="action"
                value={formData.action}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="timeIn"
                className="block text-sm font-medium text-gray-700"
              >
                Time In
              </label>
              <input
                type="time"
                name="timeIn"
                value={formData.timeIn}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="timeOut"
                className="block text-sm font-medium text-gray-700"
              >
                Time Out
              </label>
              <input
                type="time"
                name="timeOut"
                value={formData.timeOut}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="accessCardNo"
                className="block text-sm font-medium text-gray-700"
              >
                Access Card No.
              </label>
              <input
                type="text"
                name="accessCardNo"
                value={formData.accessCardNo}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ContractorForm;
