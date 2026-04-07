import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintCategories } from './complaintCategories';
import { Wrench, Zap, Droplet, Wind, Feather, Brush, Shield, Home } from 'lucide-react';

const iconMap = {
  ELECTRICAL: Zap,
  PLUMBING: Droplet,
  CARPENTRY: Wrench,
  HVAC: Wind,
  PAINTING: Brush,
  CLEANING: Feather,
  SECURITY: Shield,
  OTHER: Home,
};

const ComplaintsHome = () => {
  const { user, api } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const [canSubmitComplaints, setCanSubmitComplaints] = useState(true);

  useEffect(() => {
    if (isAdmin) return;

    const fetchUserStrikeInfo = async () => {
      try {
        const response = await api.get('/users/profile');
        setCanSubmitComplaints(response.data?.canSubmitComplaints !== false);
      } catch (error) {
        console.error('Error fetching user strike info:', error);
      }
    };

    fetchUserStrikeInfo();
  }, [api, isAdmin]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Complaint Categories</h1>
            <p className="mt-2 text-sm text-gray-500">Choose a complaint type to view issues and assign workers.</p>
          </div>
          {!isAdmin && canSubmitComplaints && (
            <Link
              to="/complaints/new"
              className="inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              Create New Complaint
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {complaintCategories.map((category) => {
          const Icon = iconMap[category.key] || Home;
          return (
            <Link
              key={category.key}
              to={`/complaints/category/${category.slug}`}
              className="group block rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-100">
                <Icon className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-gray-900">{category.label}</h2>
              <p className="mt-2 text-sm text-gray-500">View complaints for {category.label.toLowerCase()} issues.</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ComplaintsHome;
