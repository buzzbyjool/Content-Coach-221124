import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { PlusCircle, Archive, Search } from 'lucide-react';
import { Form } from '../types/form';
import { Folder } from '../types/folder';
import { FolderList } from '../components/FolderList';
import { FormList } from '../components/FormList';
import { SearchBar } from '../components/SearchBar';
import { useSearch } from '../hooks/useSearch';
import { DashboardBriefing } from '../components/DashboardBriefing';
import { useTranslation } from '../hooks/useTranslation';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<Form[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load forms
        const formsQuery = query(
          collection(db, 'forms'),
          where('userId', '==', user.uid)
        );
        const formsSnapshot = await getDocs(formsQuery);
        const formsData = formsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Form[];
        setForms(formsData);

        // Load folders
        const foldersQuery = query(
          collection(db, 'folders'),
          where('userId', '==', user.uid)
        );
        const foldersSnapshot = await getDocs(foldersQuery);
        const foldersData = foldersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Folder[];
        setFolders(foldersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleCreateFolder = async (name: string) => {
    if (!user) return;

    try {
      const newFolder: Omit<Folder, 'id'> = {
        name,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        isArchived: false,
        order: folders.length
      };

      const docRef = await addDoc(collection(db, 'folders'), newFolder);
      const createdFolder = { ...newFolder, id: docRef.id };
      setFolders(prevFolders => [...prevFolders, createdFolder]);
      return createdFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  };

  const handleMoveForm = async (formId: string, folderId: string | null) => {
    if (!formId) return;

    try {
      console.log('Moving form:', { formId, folderId });
      const formRef = doc(db, 'forms', formId);
      await updateDoc(formRef, {
        folderId,
        updatedAt: new Date().toISOString()
      });

      setForms(prevForms => 
        prevForms.map(form => 
          form.id === formId ? { ...form, folderId } : form
        )
      );
    } catch (error) {
      console.error('Error moving form:', error);
      throw error;
    }
  };

  const handleArchiveFolder = async (folderId: string) => {
    if (!folderId) return;

    try {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) return;

      const folderRef = doc(db, 'folders', folderId);
      await updateDoc(folderRef, {
        isArchived: !folder.isArchived,
        updatedAt: new Date().toISOString()
      });

      setFolders(prevFolders => 
        prevFolders.map(f => 
          f.id === folderId ? { ...f, isArchived: !f.isArchived } : f
        )
      );
    } catch (error) {
      console.error('Error archiving folder:', error);
      throw error;
    }
  };

  const handleArchiveForm = async (formId: string) => {
    if (!formId) return;

    try {
      const form = forms.find(f => f.id === formId);
      if (!form) return;

      const formRef = doc(db, 'forms', formId);
      await updateDoc(formRef, {
        isArchived: !form.isArchived,
        updatedAt: new Date().toISOString()
      });

      setForms(prevForms => 
        prevForms.map(f => 
          f.id === formId ? { ...f, isArchived: !f.isArchived } : f
        )
      );
    } catch (error) {
      console.error('Error archiving form:', error);
      throw error;
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!folderId) return;

    try {
      await deleteDoc(doc(db, 'folders', folderId));
      
      // Update forms in the deleted folder
      const formsToUpdate = forms.filter(f => f.folderId === folderId);
      for (const form of formsToUpdate) {
        if (form.id) {
          await handleMoveForm(form.id, null);
        }
      }

      setFolders(prevFolders => prevFolders.filter(f => f.id !== folderId));
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    if (!folderId) return;

    try {
      const folderRef = doc(db, 'folders', folderId);
      await updateDoc(folderRef, {
        name: newName,
        updatedAt: new Date().toISOString()
      });

      setFolders(prevFolders => 
        prevFolders.map(f => 
          f.id === folderId ? { ...f, name: newName } : f
        )
      );
    } catch (error) {
      console.error('Error renaming folder:', error);
      throw error;
    }
  };

  const filteredForms = useSearch(forms, searchQuery);
  const unorganizedForms = filteredForms.filter(form => !form.folderId && !form.isArchived);
  const archivedForms = filteredForms.filter(form => form.isArchived);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <DashboardBriefing />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('companyCoach.myCompanyCoaches')}
        </h1>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-64">
            <SearchBar 
              onSearch={setSearchQuery}
              placeholder={t('companyCoach.searchCompanies')}
            />
          </div>
          <Link
            to="/forms/new"
            className="new-coach-button"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            {t('companyCoach.createNew')}
          </Link>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Archive className="h-4 w-4 mr-1.5" />
            {showArchived ? t('companyCoach.current') : t('companyCoach.archived')}
          </button>
        </div>
      </div>

      {searchQuery && (
        <div className="mb-4 text-sm text-gray-500">
          {t('common.found', { count: filteredForms.length })}
        </div>
      )}

      <div className="space-y-6">
        {!showArchived && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('companyCoach.current')}</h2>
            <FormList 
              forms={unorganizedForms} 
              setForms={setForms} 
              onMoveForm={handleMoveForm}
              onArchive={handleArchiveForm}
            />
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <FolderList
            folders={folders}
            forms={filteredForms}
            onCreateFolder={handleCreateFolder}
            onMoveForm={handleMoveForm}
            onArchiveFolder={handleArchiveFolder}
            onArchiveForm={handleArchiveForm}
            onDeleteFolder={handleDeleteFolder}
            onRenameFolder={handleRenameFolder}
            showArchived={showArchived}
          />
        </div>

        {showArchived && archivedForms.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('companyCoach.archived')}</h2>
            <FormList 
              forms={archivedForms} 
              setForms={setForms}
              onArchive={handleArchiveForm}
            />
          </div>
        )}
      </div>
    </div>
  );
}