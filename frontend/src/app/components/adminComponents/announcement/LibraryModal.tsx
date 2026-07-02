// components/LibraryModal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, FileText, Download, ExternalLink } from 'lucide-react';
import { getImageSrc } from '../../../utils/helpers';
import { useState } from 'react';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  files: { name: string; url: string; size: string; type: string }[];
  initialTab?: 'images' | 'files';
}

export const LibraryModal = ({ isOpen, onClose, images, files, initialTab = 'images' }: LibraryModalProps) => {
  const [activeTab, setActiveTab] = useState<'images' | 'files'>(initialTab);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <>
      {/* Library Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Thư viện</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b px-6">
                <button
                  onClick={() => setActiveTab('images')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === 'images'
                      ? 'text-blue-900 border-b-2 border-blue-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Image size={18} />
                  Hình ảnh ({images.length})
                </button>
                <button
                  onClick={() => setActiveTab('files')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === 'files'
                      ? 'text-blue-900 border-b-2 border-blue-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText size={18} />
                  Tài liệu ({files.length})
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {activeTab === 'images' ? (
                  images.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      Chưa có hình ảnh nào
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((image, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          className="relative group cursor-pointer"
                          onClick={() => setSelectedImage(image)}
                        >
                          <img
                            src={getImageSrc(image) || ''}
                            alt={`Image ${idx + 1}`}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                            <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                ) : (
                  files.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      Chưa có tài liệu nào
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {files.map((file, idx) => (
                        <motion.a
                          key={idx}
                          href={getImageSrc(file.url) || ''}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                          className="flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg ${
                              file.type === 'pdf' ? 'bg-red-50' :
                              file.type === 'docx' || file.type === 'doc' ? 'bg-blue-50' :
                              file.type === 'jpg' || file.type === 'png' ? 'bg-purple-50' :
                              'bg-gray-50'
                            }`}>
                              <FileText size={20} className={
                                file.type === 'pdf' ? 'text-red-500' :
                                file.type === 'docx' || file.type === 'doc' ? 'text-blue-500' :
                                file.type === 'jpg' || file.type === 'png' ? 'text-purple-500' :
                                'text-gray-500'
                              } />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-800 truncate">
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {file.size || 'Tài liệu'}
                              </div>
                            </div>
                          </div>
                          <Download size={18} className="text-gray-400 ml-3" />
                        </motion.a>
                      ))}
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal*/}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getImageSrc(selectedImage) || ''}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};