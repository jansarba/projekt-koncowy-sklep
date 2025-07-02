import React, { useState, useEffect } from 'react';

const baseURL = import.meta.env.VITE_API_BASE_URL;


const BeatUploadPage: React.FC = () => {
  const [title, setTitle] = useState('Beat Title');
  const [bpm, setBpm] = useState(120);
  const [musicalKey, setMusicalKey] = useState('C Major');
  const [tags, setTags] = useState('hip-hop, trap');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [authorNames, setAuthorNames] = useState('sarba');
  const [sample, setSample] = useState('');
  const [isMp3Only, setIsMp3Only] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (decodedToken.role === 'admin') setIsAdmin(true);
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, []);

  const resizeImage = (file: File, maxDimension: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context not available'));
          const aspectRatio = img.width / img.height;
          canvas.width = img.width > img.height ? Math.min(img.width, maxDimension) : Math.min(img.height, maxDimension) * aspectRatio;
          canvas.height = img.width > img.height ? Math.min(img.width, maxDimension) / aspectRatio : Math.min(img.height, maxDimension);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
            else reject(new Error('Canvas toBlob failed'));
          }, file.type, 0.9);
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const resized = await resizeImage(e.target.files[0], 512);
        setImageFile(resized);
      } catch (error) {
        console.error('Image resizing failed:', error);
        alert('Failed to process image.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !bpm || !musicalKey || !tags || !imageFile || !mp3File || !authorNames.trim()) {
      alert('Please fill all required fields and upload files.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('bpm', bpm.toString());
    formData.append('musical_key', musicalKey);
    formData.append('tags', tags);
    formData.append('authors', authorNames);
    formData.append('image', imageFile);
    formData.append('mp3', mp3File);
    formData.append('sample', sample);
    formData.append('ismp3only', String(isMp3Only));
    if (zipFile) formData.append('zip', zipFile);

    try {
      const response = await fetch(`${baseURL}/api/upload-beat`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        alert('Beat uploaded successfully!');
      } else {
        const errorText = await response.text();
        alert(`Upload failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading beat:', error);
      alert('An error occurred during upload.');
    }
  };

  if (!isAdmin) return <div className="text-center p-5">404 Not Found</div>;

  return (
    <div className="flex justify-center items-start min-h-screen p-4 sm:p-6 bg-darker text-text">
      <div className="bg-darkest rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Upload New Beat</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <InputField label="BPM" type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
          <InputField label="Musical Key" value={musicalKey} onChange={(e) => setMusicalKey(e.target.value)} />
          <InputField label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
          <InputField label="Authors (comma-separated)" value={authorNames} onChange={(e) => setAuthorNames(e.target.value)} />
          <InputField label="Sample Info (optional)" value={sample} onChange={(e) => setSample(e.target.value)} />
          <FileInput label="Image" accept="image/*" onChange={handleImageChange} />
          <FileInput label="MP3" accept="audio/mp3" onChange={(e) => setMp3File(e.target.files?.[0] || null)} />
          <FileInput label="ZIP (optional)" accept=".zip" onChange={(e) => setZipFile(e.target.files?.[0] || null)} />
          <Checkbox label="MP3 only (for old beats without project files)" checked={isMp3Only} onChange={(e) => setIsMp3Only(e.target.checked)} />
          <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors">Upload Beat</button>
        </form>
      </div>
    </div>
  );
};

// Helper components for form fields
const InputField: React.FC<{ label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string }> = 
({ label, value, onChange, type = 'text' }) => (
    <div>
        <label className="block mb-1">{label}:</label>
        <input type={type} value={value} onChange={onChange} className="w-full p-2 border border-gray-600 bg-dark text-white rounded-md" />
    </div>
);

const FileInput: React.FC<{ label: string, accept: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = 
({ label, accept, onChange }) => (
    <div>
        <label className="block mb-1">{label}:</label>
        <input type="file" accept={accept} onChange={onChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
    </div>
);

const Checkbox: React.FC<{ label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = 
({ label, checked, onChange }) => (
    <div className="flex items-center">
        <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <label className="ml-2 block text-sm">{label}</label>
    </div>
);

export default BeatUploadPage;