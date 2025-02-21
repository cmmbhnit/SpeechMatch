import React, { useState } from "react";
import axios from "axios";

const SpeechMatch = () => {
  const [sampleText] = useState("Hello, how are you?");
  const [userSpeech, setUserSpeech] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const startListening = async () => {
    setIsListening(true);
    setMatchResult(null);
    
    try {
      const audioBlob = await recordAudio();
      const formData = new FormData();
      formData.append("file", audioBlob);
      formData.append("model", "whisper-1");
      
      const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
        headers: {
          "Authorization": `Bearer YOUR_OPENAI_API_KEY`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      const transcript = response.data.text;
      setUserSpeech(transcript);
      checkMatch(transcript);
    } catch (error) {
      console.error("Error processing speech: ", error);
    }
    
    setIsListening(false);
  };

  const recordAudio = async () => {
    return new Promise((resolve) => {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          resolve(audioBlob);
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 3000);
      });
    });
  };

  const checkMatch = (transcript) => {
    const similarity = compareStrings(sampleText.toLowerCase(), transcript.toLowerCase());
    setMatchResult(similarity >= 0.8 ? "✅ Match!" : "❌ Try again!");
  };

  const compareStrings = (str1, str2) => {
    let matches = 0;
    const words1 = str1.split(" ");
    const words2 = str2.split(" ");
    words1.forEach((word, index) => {
      if (words2[index] && words2[index] === word) matches++;
    });
    return matches / words1.length;
  };

  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">Speech Matching Exercise</h2>
      <p className="mb-2">Say: <strong>{sampleText}</strong></p>
      <div onClick={startListening} disabled={isListening}>
        {isListening ? "Listening..." : "Start Speaking"}
      </div>
      <p className="mt-4">Your Speech: {userSpeech || "(waiting...)"}</p>
      {matchResult && <p className="mt-2 text-lg font-semibold">{matchResult}</p>}
    </div>
  );
};

export default SpeechMatch;
