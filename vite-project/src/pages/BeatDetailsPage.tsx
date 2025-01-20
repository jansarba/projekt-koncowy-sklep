import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import WaveformOverlay from '../components/WaveformOverlay';
import { Licenses, License } from '../components/Licenses';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const BeatDetailsPage = () => {
  const { id } = useParams(); // Get the beat ID from the URL parameters
  const navigate = useNavigate();

  const [beatDetails, setBeatDetails] = useState<any>(null); // State for beat details
  const [loading, setLoading] = useState(true); // Loading state
  const [isPlaying, setIsPlaying] = useState(false); // Local play/pause state
  const [, setCurrentTime] = useState(0); // State for tracking current playback time
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null); // State for selected license
  // const [userRole, setUserRole] = useState<string | null>(null); // State for user role
  const [decodedToken, setDecodedToken] = useState<any>(null); // State for decoded JWT token
  const [opinions, setOpinions] = useState<any[]>([]); // State for opinions
  const [opinionText, setOpinionText] = useState(""); // State for opinion text
  const [authorName, setAuthorName] = useState(""); // State for optional author name

  useEffect(() => {
    const fetchBeatDetails = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the JWT token from localStorage
        const beatResponse = await fetch(`${baseURL}/api/beats/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!beatResponse.ok) {
          throw new Error('Failed to fetch beat details');
        }
        const beatData = await beatResponse.json();
        setBeatDetails(beatData);
  
        // Fetch opinions
        fetchOpinions();
  
        // Decode JWT token and set the role
        if (token) {
          const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
          setDecodedToken(decoded); // Store the decoded token
        }
  
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
  
    if (id) {
      fetchBeatDetails();
    }
  }, [id]);

  const handleDeleteOpinion = async (opinionId: number) => {
    const token = localStorage.getItem('token'); // Get the JWT token for authentication
    
    if (!token) {
      alert('You must be logged in to delete an opinion.');
      return;
    }
  
    try {
      const response = await fetch(`${baseURL}/api/beats/${id}/opinions/${opinionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        // Filter out the deleted opinion from the opinions list
        setOpinions((prevOpinions) => prevOpinions.filter(opinion => opinion.id !== opinionId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete opinion.');
      }
    } catch (error) {
      console.error('Error deleting opinion:', error);
      alert('An error occurred while deleting your opinion.');
    }
  };

  const fetchOpinions = async () => {
    try {
      const response = await fetch(`${baseURL}/api/beats/${id}/opinions`);
      if (!response.ok) {
        throw new Error("Failed to fetch opinions");
      }
      const data = await response.json();
      console.log("Opinions fetched:", data); // Log the data here
      console.log("First opinion createdAt:", data[0]?.created_at); // Log the date of the first opinion
      setOpinions(data);
    } catch (error) {
      console.error("Error fetching opinions:", error);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev); // Toggle play/pause state for local playback
  };

  const handleAddToCart = async () => {
    if (!selectedLicense) {
      alert('Please select a license before adding to cart.');
      return;
    }

    const token = localStorage.getItem('token'); // Get the JWT token for authenticated request

    if (!token) {
      navigate('/login'); // Redirect to the login page
      return;
    }

    try {
      const response = await fetch(`${baseURL}/api/carts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          beat_id: id,
          license_id: selectedLicense.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message); // Display the success message (can be used for a success notification)
      } else {
        const errorData = await response.json();
        alert(errorData.message); // Display the error message
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      alert('An error occurred while adding the item to the cart.');
    }
  };

  const handleOpinionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const name = authorName.trim() ? authorName : 'Anon'; // Default to "Anon" if name is empty
  
    try {
      const response = await fetch(`${baseURL}/api/beats/${id}/opinions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include token for authentication
        },
        body: JSON.stringify({
          content: opinionText, // Match backend field name
          author: name,         // Optional name
        }),
      });
  
      if (response.ok) {
        const newOpinion = await response.json();
        setOpinions([newOpinion, ...opinions]); // Add new opinion to the list
        setOpinionText(''); // Clear the opinion text input
        setAuthorName('');  // Clear the author name input
        fetchOpinions();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to submit opinion.'); // Show backend error message
      }
    } catch (error) {
      console.error('Error submitting opinion:', error);
      alert('An error occurred while submitting your opinion.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!beatDetails) {
    return <div>Beat not found</div>;
  }

  return (
    <div className="beat-details-page">
      <div className="beat-details flex flex-col md:flex-row gap-4 justify-between items-start flex-wrap">
        {/* Beat Info */}
        <div className="flex flex-col gap-4 flex-grow max-w-48">
          <div className="text-2xl font-bold">{beatDetails.title}</div>
          <div className="beat-info">
            <p><strong>BPM:</strong> {beatDetails.bpm}</p>
            <p><strong>Key:</strong> {beatDetails.musical_key}</p>
            <p><strong>Author:</strong> {beatDetails.authors.join(', ')}</p>
            <p><strong>Tags:</strong> {beatDetails.tags.join(', ')}</p>
          </div>
        </div>

        {/* Licenses */}
        <Licenses setSelectedLicense={setSelectedLicense} />

        {/* Beat Image */}
        <div className='w-fit'>
          <div
            className="flex justify-center items-center w-full md:w-auto order-first md:order-none">
            <div className="beat-image bg-darkest flex justify-center items-center rounded aspect-square w-full md:w-80">
              <img
                src={beatDetails.image_url}
                alt={beatDetails.title}
                className="rounded object-contain w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add to Cart Button below Licenses */}
      <div className="add-to-cart-button mt-4">
        <button
          onClick={handleAddToCart}
          className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Add to Cart
        </button>
      </div>

      <div className="waveform-section flex flex-col items-center gap-4 p-4">
        <div className="relative w-full">
          <WaveformOverlay
            audioUrl={beatDetails.mp3_url}
            isPlaying={isPlaying}
            setCurrentTime={setCurrentTime}
          />
        </div>
        <div className="play-pause-button mt-4">
          <button 
            className="p-2 bg-darkes text-white rounded flex items-center justify-center"
            onClick={handlePlayPause}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
              {isPlaying ? (
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /> // Pause icon
              ) : (
                <path d="M8 5v14l11-7L8 5z" /> // Play icon
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className="opinions-section mt-6">
  <h2>Opinions</h2>

  {decodedToken ? (
    <div className="opinion-form mt-4">
      <form onSubmit={handleOpinionSubmit}>
        <div>
          <label htmlFor="authorName">Your Name (optional):</label>
          <input
            id="authorName"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="border p-2 w-full mt-2 text-black"
            placeholder="Nazwa (opcjonalna)"
          />
        </div>
        <div>
          <label htmlFor="opinionText">Your Opinion:</label>
          <textarea
            id="opinionText"
            value={opinionText}
            onChange={(e) => setOpinionText(e.target.value)}
            className="border p-2 w-full mt-2 text-black"
            placeholder="Write your opinion here"
            required
          />
        </div>
        <div>
          <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded">
            Submit Opinion
          </button>
        </div>
      </form>
    </div>
  ) : (
    <p className="mt-4 text-gray-600">You must be logged in to leave an opinion.</p>
  )}

        <div className="opinions-list mt-6">
    {opinions.map((opinion) => {
      const createdAt = opinion.created_at ? new Date(opinion.created_at) : null;
      const isUserOpinion = decodedToken?.id === opinion.user_id || decodedToken?.role === "admin"; // Check if the opinion belongs to the current user

      return (
        <div key={opinion.id} className="opinion-item border-b py-4">
          <div className="text-sm text-gray-600">
            <strong>{opinion.name}</strong> -{" "}
            {createdAt && !isNaN(createdAt.getTime())
              ? createdAt.toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Invalid Date"}
          </div>
          <p>{opinion.content}</p>

          {/* Render Delete Button if the opinion belongs to the current user */}
          {isUserOpinion && (
            <button
              className="text-red-500 mt-2"
              onClick={() => handleDeleteOpinion(opinion.id)}
            >
              Delete
            </button>
          )}
        </div>
      );
    })}
  </div>

      </div>
    </div>
  );
};