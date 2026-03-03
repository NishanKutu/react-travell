import React, { useState } from "react";
import { AiOutlineClose, AiOutlineCloudUpload } from "react-icons/ai";
import { register } from "../api/authAPI";

const SignupPage = ({ isOpen, onClose, switchToLogin }) => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [guideData, setGuideData] = useState({
    experience: "",
    age: "",
    bio: "",
    specialization: "",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Create local preview URL
    }
  };

  const handleGuideChange = (e) => {
    setGuideData({ ...guideData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // USE FormData for file uploads
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);

      if (image) formData.append("image", image);

      if (role === 2) {
        formData.append("experience", guideData.experience);
        formData.append("age", guideData.age);
        formData.append("bio", guideData.bio);
        formData.append("specialization", guideData.specialization);
      }

      // Pass formData to your API
      const data = await register(formData);

      if (data.error) {
        alert(data.error);
      } else {
        alert(
          "User registered successfully. Check email for verification link."
        );
        onClose();
      }
    } catch (err) {
      alert(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white text-black w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <AiOutlineClose size={24} />
        </button>

        <h2 className="text-3xl font-bold text-[#004d4d] mb-2 text-center">
          Create Account
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Role Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-2">
            <button
              type="button"
              className={`flex-1 py-2 text-sm rounded-md ${
                role === 0 ? "bg-white shadow text-[#004d4d]" : "text-gray-500"
              }`}
              onClick={() => setRole(0)}
            >
              User
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm rounded-md ${
                role === 2 ? "bg-white shadow text-[#004d4d]" : "text-gray-500"
              }`}
              onClick={() => setRole(2)}
            >
              Guide
            </button>
          </div>

          {/* Image Upload Section */}
          <div className="flex flex-col items-center mb-2">
            <label className="relative cursor-pointer group">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 group-hover:border-[#004d4d] transition-all">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <AiOutlineCloudUpload
                    size={30}
                    className="text-gray-400 group-hover:text-[#004d4d]"
                  />
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
            <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">
              Upload Profile Photo
            </span>
          </div>

          {/* Standard Fields */}
          <input
            type="text"
            placeholder="Username"
            className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#004d4d]"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#004d4d]"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Guide Specific Fields */}
          {role === 2 && (
            <div className="p-4 bg-gray-50 rounded-xl border flex flex-col gap-3">
              <input
                type="number"
                name="experience"
                placeholder="Years of Experience"
                className="p-2 border rounded-md"
                onChange={handleGuideChange}
                required
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                className="p-2 border rounded-md"
                onChange={handleGuideChange}
                required
              />
              <input
                type="text"
                name="specialization"
                placeholder="Specialization"
                className="p-2 border rounded-md"
                onChange={handleGuideChange}
                required
              />
              <textarea
                name="bio"
                placeholder="Brief Bio"
                className="p-2 border rounded-md"
                onChange={handleGuideChange}
                rows="2"
              />
            </div>
          )}

          <input
            type="password"
            placeholder="Password"
            className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#004d4d]"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-[#004d4d] text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Processing..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
