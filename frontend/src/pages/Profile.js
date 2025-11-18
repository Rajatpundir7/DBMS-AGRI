import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  const fetchDiagnoses = async () => {
    try {
      const response = await api.get('/diagnosis/my-diagnoses');
      setDiagnoses(response.data || []);
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="text-4xl text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-gray-600 capitalize">{user?.role}</p>
            </div>
            <div className="space-y-4">
              {user?.email && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <FiMail /> <span>{user.email}</span>
                </div>
              )}
              {user?.phone && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <FiPhone /> <span>{user.phone}</span>
                </div>
              )}
              {user?.location?.address && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <FiMapPin /> <span>{user.location.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">My Diagnoses</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : diagnoses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No diagnoses yet</p>
                <a href="/diagnosis" className="text-primary-600 hover:underline mt-2 inline-block">
                  Start your first diagnosis
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {diagnoses.map(diagnosis => (
                  <div key={diagnosis._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{diagnosis.crop || 'Unknown Crop'}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(diagnosis.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {diagnosis.results && diagnosis.results.length > 0 && (
                      <div className="mt-3">
                        {diagnosis.results.map((result, idx) => (
                          <div key={idx} className="bg-gray-50 rounded p-2 mb-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{result.label}</span>
                              <span className="text-sm text-gray-600">{result.confidence}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

