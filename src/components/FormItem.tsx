import { useDrag } from 'react-dnd';
import { Form } from '../types/form';
import { Image, Calendar, FileText, MoreVertical, Pencil, Archive, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';

interface FormItemProps {
  form: Form;
  onSelect: () => void;
  onDelete: () => void;
  onArchive?: (formId: string) => Promise<void>;
  onScheduleMeeting: () => void;
  defaultPresentationUrl: string;
  index: number;
}

export function FormItem({ 
  form, 
  onSelect, 
  onDelete, 
  onArchive,
  onScheduleMeeting,
  defaultPresentationUrl,
  index
}: FormItemProps) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'form',
    item: { 
      id: form.id, 
      type: 'form',
      currentFolderId: form.folderId 
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }), [form.id, form.folderId]);

  return (
    <motion.div
      ref={drag}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`p-4 sm:p-6 ${isDragging ? 'opacity-50' : ''} cursor-move bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300`}
      style={{
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <motion.button
          onClick={onSelect}
          className="group flex items-center space-x-4 hover:opacity-75 transition-opacity"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {form.logoUrl ? (
            <motion.img 
              src={form.logoUrl} 
              alt={`${form.companyName} logo`}
              className="w-12 h-12 object-contain rounded-lg border border-gray-200"
              animate={{ rotate: isHovered ? [0, -5, 5, 0] : 0 }}
              transition={{ duration: 0.5 }}
            />
          ) : (
            <motion.div 
              className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"
              animate={{ rotate: isHovered ? [0, -5, 5, 0] : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image className="w-6 h-6 text-gray-400" />
            </motion.div>
          )}
          <div>
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
              {form.companyName}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('companyCoach.createdOn')} {new Date(form.createdAt).toLocaleDateString()}
            </p>
          </div>
        </motion.button>

        <div className="flex items-center space-x-2">
          <motion.button
            onClick={onScheduleMeeting}
            className="p-2 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-full"
            title={t('meetings.schedule')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Calendar className="h-5 w-5" />
          </motion.button>

          <motion.a
            href={form.presentationUrl || defaultPresentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-full"
            title={t('companyCoach.viewPresentation')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FileText className="h-5 w-5" />
          </motion.a>

          <div className="relative">
            <motion.button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-full"
              title={t('common.actions')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreVertical className="h-5 w-5" />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                >
                  <div className="py-1">
                    <Link
                      to={`/forms/edit/${form.id}`}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      {t('common.edit')}
                    </Link>
                    {onArchive && (
                      <button
                        onClick={() => {
                          onArchive(form.id!);
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        {form.isArchived ? t('common.unarchive') : t('common.archive')}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('common.delete')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}