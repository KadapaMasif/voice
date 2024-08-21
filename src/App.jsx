import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSpeechSynthesis } from 'react-speech-kit';
import 'tailwindcss/tailwind.css';

const App = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [response, setResponse] = useState('');
  const { speak, cancel, speaking } = useSpeechSynthesis();
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setTranscript(prevTranscript => prevTranscript + finalTranscript);
        setInterimTranscript(interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event);
      };

      setRecognition(recognition);
    } else {
      alert('Web Speech API is not supported in this browser.');
    }
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      recognition.start();
    }
    setIsListening(!isListening);
  };

  const fetchSearchResults = async (query) => {
    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: 'AIzaSyB7aB0HCfzJlDrO4ncFAWjeTt8ookn1Ong',
          cx: '8463240f4090d4d39',
          q: query,
        },
      });

      if (response.data.items && response.data.items.length > 0) {
        // Combine snippets from multiple search results
        const combinedSnippets = response.data.items.map(item => item.snippet).join(' ');
        setResponse(combinedSnippets);
        speak({ text: combinedSnippets });
      } else {
        setResponse('No results found');
        speak({ text: 'No results found' });
      }
    } catch (error) {
      console.error('Error fetching search results', error);
      setResponse('Error fetching search results');
      speak({ text: 'Error fetching search results' });
    }
  };

  useEffect(() => {
    if (transcript && !isListening) {
      fetchSearchResults(transcript);
    }
  }, [transcript, isListening]);

  const handleStopClick = () => {
    if (speaking) {
      cancel();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-3/4">
        <h1 className="text-2xl font-bold mb-4">Voice Buddy</h1>
        <button
          onClick={handleMicClick}
          className={`${
            isListening ? 'bg-red-500' : 'bg-green-500'
          } text-white py-2 px-4 rounded-full mb-4`}
        >
          {isListening ? 'Stop' : 'Start'} Listening
        </button>
        <button
          onClick={handleStopClick}
          className="bg-yellow-500 text-white py-2 px-4 rounded-full mb-4 ml-2"
        >
          Stop Speaking
        </button>
        {(transcript || interimTranscript) && (
          <div className="mt-4">
            <h2 className="text-xl font-bold">Transcript</h2>
            <p className="mt-2">{transcript + interimTranscript}</p>
          </div>
        )}
        {response && (
          <div className="mt-4">
            <h2 className="text-xl font-bold">Response</h2>
            <textarea
              className="mt-2 bg-white w-full h-40 p-2 border rounded"  
              value={response}
              readOnly
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
