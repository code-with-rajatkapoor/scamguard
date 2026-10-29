import { useCallback, useState } from 'react';
import { Mic, Square, Mic2 } from 'lucide-react';

interface VoiceInputProps {
  onChange: (text: string) => void;
}

export default function VoiceInput({ onChange }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    setError(null);

    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalText = '';

    (recognition as SpeechRecognition & { onstart: () => void }).onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results.item(i);
        const transcript = result.transcript;
        if (result.isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }
      onChange(finalText + interim);
    };

    recognition.onerror = (event) => {
      setError(event.error === 'no-speech' ? 'No speech detected. Please try again.' : `Recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      if (isListening) {
        // Re-start to continue listening
        try {
          recognition.start();
        } catch {
          setIsListening(false);
          setError('Microphone access denied. Please allow microphone access.');
        }
      } else {
        setIsListening(false);
      }
    };

    try {
      recognition.start();
    } catch {
      setError('Microphone access denied. Please allow microphone access.');
    }
  }, [onChange, isListening]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setError(null);
    // The recognition instance is stopped internally
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {isListening ? (
          <Mic className="h-6 w-6 text-red-400 animate-pulse" />
        ) : (
          <Mic2 className="h-6 w-6 text-slate-400" />
        )}
        <button
          onClick={toggleListening}
          className={`absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
          }`}
          disabled={error !== null}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        >
          {isListening ? <Square className="h-4 w-4" /> : <Mic2 className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-xs text-slate-500">
        {isListening ? 'Listening...' : 'Click the microphone and speak'}
      </p>
      <p className="text-xs text-slate-600">Speak clearly. Your speech will be typed automatically.</p>
    </div>
  );
}
