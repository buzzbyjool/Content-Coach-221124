import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Users as UsersIcon, ClipboardList, Pencil, Trash2 } from 'lucide-react';
import { Form } from '../../types/form';
import { DeleteFormDialog } from '../../components/DeleteFormDialog';
import { FormDetailsModal } from '../../components/FormDetailsModal';
import { ApiKeyManager } from '../../components/admin/ApiKeyManager';

interface FormWithCreator extends Form {
  creatorEmail?: string;
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<FormWithCreator[]>([]);
  const [stats, setStats] = useState({
    totalForms: 0,
    totalUsers: 0
  });
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const isSuperAdmin = user?.email === 'julien.doussot@mac.com';

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch all forms
        const formsQuery = query(collection(db, 'forms'));
        const formsSnapshot = await getDocs(formsQuery);
        
        // Fetch all users to map user IDs to emails
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const userMap = new Map();
        usersSnapshot.docs.forEach(doc => {
          userMap.set(doc.id, doc.data().email);
        });

        // Map forms with creator emails
        const formsData = formsSnapshot.docs.map(doc => {
          const formData = doc.data();
          return {
            id: doc.id,
            ...formData,
            creatorEmail: userMap.get(formData.userId) || 'Unknown User'
          };
        }) as FormWithCreator[];

        setForms(formsData);
        setStats({
          totalForms: formsData.length,
          totalUsers: usersSnapshot.size
        });
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDeleteForm = async () => {
    if (!formToDelete?.id) return;

    try {
      await deleteDoc(doc(db, 'forms', formToDelete.id));
      setForms(forms.filter(form => form.id !== formToDelete.id));
      setStats(prev => ({ ...prev, totalForms: prev.totalForms - 1 }));
      setFormToDelete(null);
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link
          to="/admin/users"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <UsersIcon className="h-5 w-5 mr-2" />
          Manage Users
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardList className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Forms
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.totalForms}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="mb-8">
          <ApiKeyManager />
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">All Forms</h2>

          <div className="mt-4">
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created By
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created At
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {forms.map((form) => (
                          <tr key={form.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedForm(form)}
                                className="flex items-center group hover:opacity-75 transition-opacity"
                              >
                                {form.logoUrl ? (
                                  <img
                                    src={form.logoUrl}
                                    alt={`${form.companyName} logo`}
                                    className="h-8 w-8 rounded-full object-contain"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <ClipboardList className="h-4 w-4 text-gray-400" />
                                  </div>
                                )}
                                <span className="ml-3 font-medium text-gray-900 group-hover:text-teal-600">
                                  {form.companyName}
                                </span>
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {form.creatorEmail}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(form.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Link
                                  to={`/forms/edit/${form.id}`}
                                  className="text-teal-600 hover:text-teal-900 p-2 hover:bg-teal-50 rounded-full"
                                  title="Edit form"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => setFormToDelete(form)}
                                  className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full"
                                  title="Delete form"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteFormDialog
        isOpen={!!formToDelete}
        onClose={() => setFormToDelete(null)}
        onConfirm={handleDeleteForm}
        companyName={formToDelete?.companyName || ''}
      />

      {selectedForm && (
        <FormDetailsModal
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
        />
      )}
    </div>
  );
}