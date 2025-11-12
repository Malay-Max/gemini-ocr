import React from 'react';
import { Icon } from './icons';

interface UploadNextImageProps {
  onImageSelect: (file: File) => void;
}

const UploadNextImage: React.FC<UploadNextImageProps> = ({ onImageSelect }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageSelect(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <label
      htmlFor="next-file-upload"
      className="relative flex flex-col items-center justify-center w-full py-4 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center justify-center">
        <Icon name="upload" className="w-8 h-8 mb-2 text-gray-400" />
        <p className="text-sm text-gray-400"><span className="font-semibold">Upload Another Image</span> or drag and drop</p>
      </div>
      <input ref={fileInputRef} id="next-file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
    </label>
  );
};

export default UploadNextImage;
