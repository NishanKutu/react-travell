import React, { useEffect, useState } from "react";
import { getAllDestinations, deleteDestination } from "../../api/destinationApi";
import { Link } from "react-router-dom";

const DestinationsList = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const auth = JSON.parse(localStorage.getItem("auth"));
    const token = auth?.token;

    const fetchTrips = async () => {
        try {
            const response = await getAllDestinations();
            setTrips(response.data); 
            setLoading(false);
        } catch (error) {
            alert(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const handleDelete = async (id) => {
        // 2. Extra safety check
        if (!token) {
            alert("Session expired. Please login again.");
            return;
        }

        if (window.confirm("Are you sure you want to delete this trip?")) {
            try {
                await deleteDestination(id, token);
                alert("Destination deleted successfully!");
                fetchTrips();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading trips...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Trip Packages</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Currently managing <span className="font-semibold text-blue-600">{trips.length}</span> active destinations
                    </p>
                </div>
                <Link
                    to="/admin/add-destination"
                    className="mt-4 md:mt-0 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium transition duration-200 shadow-md"
                >
                    + Create New Trip
                </Link>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Package Details</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Location</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Capacity</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {trips.map((trip) => (
                                <tr key={trip._id} className="hover:bg-slate-50 transition duration-150">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{trip.title}</div>
                                        <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{trip.descriptions}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            📍 {trip.location}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{trip.groupSize} People</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {trip.isNewTrip && (
                                                <span className="px-2 py-1 rounded bg-orange-100 text-blue-700 text-[10px] font-bold uppercase">New</span>
                                            )}
                                            {trip.isBestSeller && (
                                                <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-[10px] font-bold uppercase">Hot</span>
                                            )}
                                            {trip.isPromo && (
                                                <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase">Sale</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <Link
                                            to={`/admin/edit-destination/${trip._id}`}
                                            className="text-blue-600 hover:text-blue-900 text-sm font-semibold transition"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(trip._id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-semibold transition"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DestinationsList;