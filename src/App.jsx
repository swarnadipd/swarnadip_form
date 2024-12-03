import React, { useState, useEffect } from "react";
import { Trash2, Edit, CheckCircle, FileUp, Save } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const API_RESPONSES = {
  "User Information": {
    fields: [
      {
        name: "firstName",
        type: "text",
        label: "First Name",
        required: true,
        placeholder: "eg. Swarnadip",
      },
      {
        name: "lastName",
        type: "text",
        label: "Last Name",
        required: true,
        placeholder: "eg. Dasgupta",
      },
      {
        name: "age",
        type: "number",
        label: "Age",
        required: false,
        placeholder: "eg.21",
      },
    ],
  },
  "Address Information": {
    fields: [
      {
        name: "street",
        type: "text",
        label: "Street Address",
        required: true,
        placeholder: "eg. 123 Main Street",
      },
      {
        name: "city",
        type: "text",
        label: "City",
        required: true,
        placeholder: "eg. Kolkata",
      },
      {
        name: "state",
        type: "select",
        label: "State",
        options: ["West bengal", "Mumbai", "Delhi", "Pune"],
        required: true,
        placeholder: "eg. West Bengal",
      },
      {
        name: "zipCode",
        type: "text",
        label: "Zip Code",
        required: false,
        placeholder: "eg. 94105",
      },
    ],
  },
  "Payment Information": {
    fields: [
      {
        name: "cardNumber",
        type: "text",
        label: "Card Number",
        required: true,
        placeholder: "eg.**** **** **** 1111",
      },
      {
        name: "expiryDate",
        type: "date",
        label: "Expiry Date",
        required: true,
        placeholder: "MM/YY",
      },
      {
        name: "cvv",
        type: "password",
        label: "CVV",
        required: true,
        placeholder: "eg. 123",
      },
      {
        name: "cardholderName",
        type: "text",
        label: "Cardholder Name",
        required: true,
        placeholder: "eg. swarnadip dasgupta",
      },
    ],
  },
};

const DynamicForm = () => {
  const [selectedFormType, setSelectedFormType] = useState("");
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState({});
  const [progress, setProgress] = useState(0);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // New array to track the order of forms
  const formOrder = [
    "User Information",
    "Address Information",
    "Payment Information",
  ];

  const handleFormTypeChange = (e) => {
    const type = e.target.value;
    setSelectedFormType(type);
    setFormFields(API_RESPONSES[type].fields);
    resetForm();
  };

  const resetForm = () => {
    setFormData({});
    setErrors({});
    setProgress(0);
    setEditingEntry(null);
    setIsSubmitted(false);
  };

  const handleInputChange = (name, value) => {
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    const requiredFields = formFields.filter((field) => field.required);
    const filledFields = requiredFields.filter(
      (field) =>
        updatedFormData[field.name] && updatedFormData[field.name].trim() !== ""
    );
    const newProgress = Math.round(
      (filledFields.length / requiredFields.length) * 100
    );
    setProgress(newProgress);

    const newErrors = { ...errors };
    delete newErrors[name];
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    formFields.forEach((field) => {
      if (
        field.required &&
        (!formData[field.name] || formData[field.name].trim() === "")
      ) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const updatedSubmittedData = {
        ...submittedData,
        [selectedFormType]: {
          ...formData,
          submittedAt: new Date().toLocaleString(),
        },
      };

      setSubmittedData(updatedSubmittedData);
      setIsSubmitted(true);
      toast.success(
        editingEntry
          ? "Changes saved successfully!"
          : "Form submitted successfully!"
      );

      // Find the next form in the sequence
      const currentIndex = formOrder.indexOf(selectedFormType);
      const nextFormIndex = currentIndex + 1;

      if (nextFormIndex < formOrder.length) {
        const nextForm = formOrder[nextFormIndex];

        setTimeout(() => {
          setSelectedFormType(nextForm);
          setFormFields(API_RESPONSES[nextForm].fields);
          resetForm();
        }, 2000);
      } else {
        setTimeout(() => {
          resetForm();
          setSelectedFormType("");
        }, 2000);
      }
    }
  };

  const handleDeleteEntry = (formType) => {
    const updatedSubmittedData = { ...submittedData };
    delete updatedSubmittedData[formType];
    setSubmittedData(updatedSubmittedData);
    toast.success("Entry deleted successfully.");
  };

  const handleEditEntry = (formType) => {
    setSelectedFormType(formType);
    setFormFields(API_RESPONSES[formType].fields);
    setFormData(submittedData[formType]);
    setEditingEntry(formType);
  };

  const renderFormFields = () => {
    return formFields.map((field) => {
      const renderInput = () => {
        if (field.type === "select") {
          return (
            <motion.select
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={`
                w-full px-4 py-3 border-2 rounded-xl 
                transition-all duration-300 ease-in-out
                focus:ring-4 focus:ring-blue-200 focus:border-blue-500
                ${
                  errors[field.name]
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-blue-400"
                }
              `}
            >
              <option value="" className="text-gray-400">
                Select {field.label}
              </option>
              {field.options?.map((option) => (
                <option
                  key={option}
                  value={option}
                  className="hover:bg-blue-100"
                >
                  {option}
                </option>
              ))}
            </motion.select>
          );
        }

        return (
          <motion.input
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`
              w-full px-4 py-3 border-2 rounded-xl 
              transition-all duration-300 ease-in-out
              focus:ring-4 focus:ring-blue-200 focus:border-blue-500
              ${
                errors[field.name]
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-blue-400"
              }
            `}
          />
        );
      };

      return (
        <motion.div
          key={field.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <label className="block mb-3 text-sm font-semibold text-gray-700 pl-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderInput()}
          {errors[field.name] && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-xs mt-2 pl-1 flex items-center"
            >
              <Sparkles size={12} className="mr-1 text-red-400" />
              {errors[field.name]}
            </motion.p>
          )}
        </motion.div>
      );
    });
  };

  const renderSubmittedEntries = () => {
    const entries = Object.entries(submittedData);
    if (entries.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mt-8 space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Submitted Entries
        </h2>
        <AnimatePresence>
          {entries.map(([formType, data]) => (
            <motion.div
              key={formType}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-100 relative"
            >
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-700">
                  {formType}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditEntry(formType)}
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                    title="Edit Entry"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(formType)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data)
                  .filter(([key]) => key !== "submittedAt")
                  .map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-2 rounded">
                      <span className="text-xs text-gray-500 block mb-1 uppercase">
                        {key}
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {value}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="mt-4 text-right text-xs text-gray-500">
                <CheckCircle
                  className="inline-block mr-1 text-green-500"
                  size={12}
                />
                Submitted on: {data.submittedAt}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  const ProgressBar = () => {
    const getProgressColor = () => {
      if (progress < 33) return "bg-red-500";
      if (progress < 66) return "bg-yellow-500";
      return "bg-green-500";
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span
                className={`
                  text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full 
                  ${getProgressColor()} text-white
                `}
              >
                Form Completion
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-gray-600">
                {progress}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <motion.div
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 50,
              }}
              className={`
                shadow-none flex flex-col text-center whitespace-nowrap 
                text-white justify-center ${getProgressColor()}
              `}
            ></motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen flex flex-col"
    >
      <Toaster position="top-right" />
      <div className="bg-white shadow-xl rounded-lg p-8 flex-grow">
        <header className="text-center mb-6">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-800 mb-2"
          >
            Dynamic Form Builder
          </motion.h1>
          <p className="text-gray-600">
            Select a form type and fill out the details
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Select Form Type
          </label>
          <select
            value={selectedFormType}
            onChange={handleFormTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a Form Type</option>
            {Object.keys(API_RESPONSES).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </motion.div>

        {selectedFormType && <ProgressBar />}

        {selectedFormType && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {renderFormFields()}
            <button
              type="submit"
              className="
            w-full py-3 rounded-xl 
            bg-gradient-to-r from-blue-600 to-purple-600 
            text-white font-bold tracking-wider
            hover:from-blue-700 hover:to-purple-700
            transition-all duration-300 ease-in-out
            transform hover:scale-[1.02] hover:shadow-xl
            flex items-center justify-center
            group
          "
            >
              {editingEntry ? (
                <>
                  <Save
                    size={20}
                    className="mr-3 transition-transform group-hover:rotate-6"
                  />
                  Update Entry
                </>
              ) : (
                <>
                  <FileUp
                    size={20}
                    className="mr-3 transition-transform group-hover:rotate-6"
                  />
                  Submit Form
                </>
              )}
            </button>
          </motion.form>
        )}

        {renderSubmittedEntries()}
      </div>
      <footer className="text-center mt-4 text-gray-500">
        © 2024 Dynamic Form Stealth Startup. All rights reserved - SWARNADIP -
      </footer>
    </motion.div>
  );
};

export default DynamicForm;
