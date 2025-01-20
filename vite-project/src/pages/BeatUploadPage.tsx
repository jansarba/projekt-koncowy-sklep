import React, { useState, useEffect } from 'react';
const baseURL = import.meta.env.VITE_API_BASE_URL;

const UploadBeat: React.FC = () => {
    const [title, setTitle] = useState('Beat Title');
    const [bpm, setBpm] = useState(120);
    const [musicalKey, setMusicalKey] = useState('C Major');
    const [tags, setTags] = useState('hip-hop, trap');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [mp3File, setMp3File] = useState<File | null>(null);
    const [authorNames, setAuthorNames] = useState('sarba');
    const [isAdmin, setIsAdmin] = useState(false);
    const [tagOptions, setTagOptions] = useState<{ value: string; label: string }[]>([]);
    const [authorOptions, setAuthorOptions] = useState<{ id: number; name: string }[]>([]);
    const [sample, setSample] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode and parse the payload
                if (decodedToken.role === 'admin') {
                    setIsAdmin(true); // Set isAdmin if the role is 'admin'
                }
            } catch (error) {
                console.error('Invalid token', error);
            }
        }

        // Fetch tags and authors
        const fetchData = async () => {
            try {
                const tagsResponse = await fetch(`${baseURL}/api/tags`);
                const tagsData = await tagsResponse.json();
                setTagOptions(tagsData);

                const authorsResponse = await fetch(`${baseURL}/api/authors`);
                const authorsData = await authorsResponse.json();
                setAuthorOptions(authorsData);
            } catch (error) {
                console.error('Error fetching tags/authors:', error);
            }
        };

        fetchData();
    }, []);

    const resizeImage = (file: File, maxDimension: number): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const img = new Image();

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        reject(new Error('Could not get canvas context'));
                        return;
                    }

                    const aspectRatio = img.width / img.height;

                    if (img.width > img.height) {
                        canvas.width = Math.min(img.width, maxDimension);
                        canvas.height = canvas.width / aspectRatio;
                    } else {
                        canvas.height = Math.min(img.height, maxDimension);
                        canvas.width = canvas.height * aspectRatio;
                    }

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const resizedFile = new File([blob], file.name, { type: file.type });
                                resolve(resizedFile);
                            } else {
                                reject(new Error('Canvas toBlob failed'));
                            }
                        },
                        file.type,
                        0.9 // Adjust the quality (0.9 is high quality)
                    );
                };

                img.onerror = (err) => reject(err);
                img.src = event.target?.result as string;
            };

            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            try {
                const resizedImage = await resizeImage(file, 1024);
                setImageFile(resizedImage);
            } catch (error) {
                console.error('Error resizing image:', error);
                alert('Failed to process the image file.');
            }
        }
    };

    const handleMp3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setMp3File(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!title || !bpm || !musicalKey || !tags || !imageFile || !mp3File || !authorNames.trim()) {
            alert('Please fill in all fields and upload both files.');
            return;
        }

        const formattedAuthors = authorNames.split(',').map((author) => author.trim()).filter((author) => author.length > 0);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('bpm', bpm.toString());
        formData.append('musical_key', musicalKey);
        formData.append('tags', tags);
        formData.append('image', imageFile);
        formData.append('mp3', mp3File);
        formData.append('authors', formattedAuthors.join(','));
        formData.append('sample', sample);

        try {
            const response = await fetch(`${baseURL}/api/upload-beat`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                console.log(sample)
                alert('Beat uploaded successfully');
            } else {
                const errorText = await response.text();
                alert(`Failed to upload beat: ${errorText}`);
            }
        } catch (error) {
            console.error('Error uploading beat:', error);
            alert('An error occurred while uploading the beat.');
        }
    };

    if (!isAdmin) {
        return (
            <div className="text-center p-5">
                <p>You must be an admin to upload beats.</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-60 pt-0 text-black">
            <div className="bg-white rounded-lg shadow-lg w-full sm:w-96">
                <h2 className="text-2xl font-bold text-center text-black">Upload New Beat</h2>
                <form className="">
                    <div>
                        <label htmlFor="title" className="block text-black">Title:</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="bpm" className="block text-black">BPM:</label>
                        <input
                            type="number"
                            id="bpm"
                            value={bpm}
                            onChange={(e) => setBpm(Number(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="musicalKey" className="block text-black">Musical Key:</label>
                        <input
                            type="text"
                            id="musicalKey"
                            value={musicalKey}
                            onChange={(e) => setMusicalKey(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-black">Tags (comma separated):</label>
                        <input
                            type="text"
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="authors" className="block text-black">Authors (comma separated):</label>
                        <input
                            type="text"
                            id="authors"
                            value={authorNames}
                            onChange={(e) => setAuthorNames(e.target.value)}
                            placeholder="e.g., Author1, Author2"
                            className="w-full p-3 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="image" className="block text-black">Upload Image:</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full p-3 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="mp3" className="block text-black">Upload MP3:</label>
                        <input
                            type="file"
                            id="mp3"
                            accept="audio/mp3"
                            onChange={handleMp3Change}
                            className="w-full p-3 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="sample" className="block text-black">Sample info: (link/nazwa nuty !opcjonalne!)</label>
                        <input
                            type="text"
                            id="sample"
                            value={sample}
                            onChange={(e) => setSample(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="flex justify-center mt-6">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="bg-blue-500 text-white p-3 rounded-md w-full hover:bg-blue-600"
                        >
                            Upload Beat
                        </button>
                    </div>
                </form>

                {/* Display Tags and Authors as Plain Text */}
                <div className="mt-8">
                    <h3 className="text-xl font-semibold">Tagi dotychczas (jesli wpiszesz inny to automatycznie sie doda + wielkosc liter nie ma znaczenia jak sobie filtruja):</h3>
                    <ul className="list-disc pl-5">
                        {tagOptions.map((tag) => (
                            <li key={tag.value} className="text-black">{tag.label}</li>
                        ))}
                    </ul>
                    <h3 className="text-xl font-semibold mt-4">Autorzy dotychczas (tez sie samo doda jak cos):</h3>
                    <ul className="list-disc pl-5">
                        {authorOptions.map((author) => (
                            <li key={author.id} className="text-black">{author.name}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UploadBeat;