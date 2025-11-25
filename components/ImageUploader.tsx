
import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  language: 'en' | 'es';
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(language === 'en' ? 'Please upload an image file.' : 'Por favor sube un archivo de imagen.');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onImageSelected(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const text = {
    en: {
      title: "Upload Image",
      subtitle: "Drag & drop or click to select"
    },
    es: {
      title: "Subir Imagen",
      subtitle: "Arrastra o haz clic para seleccionar"
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ease-in-out
        ${isDragging ? 'border-arri-gold bg-arri-gray' : 'border-gray-600 hover:border-gray-400 bg-arri-dark'}
      `}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-arri-gray flex items-center justify-center text-arri-gold">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-medium text-white">{text[language].title}</h3>
          <p className="text-gray-400 mt-2 text-sm">{text[language].subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
