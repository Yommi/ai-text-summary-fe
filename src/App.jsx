import { useRef, useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";

export default function Summarizer() {
  const MAX_CHAR_LIMIT = 3500;

  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Optional: show error message
  const textareaRef = useRef(null);

  const handleSummarize = async () => {
    if (inputText.length > MAX_CHAR_LIMIT) {
      setError(`Text too long. Limit is ${MAX_CHAR_LIMIT} characters.`);
      return;
    }

    setLoading(true);
    setError(""); // clear any previous errors

    try {
      const response = await fetch(
        "https://ai-text-summary-app-6v0z.onrender.com/api/v1/texts/summarize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: inputText }),
        }
      );

      const data = await response.json();
      setSummary(data.summary);
      setInputText("");
    } catch (error) {
      console.error("Error summarizing text:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [inputText]);

  return (
    <div className="min-h-screen bg-gray-700 flex flex-col items-center px-4 pt-10 pb-32">
      <h1 className="text-3xl lg:text-5xl font-bold text-blue-700 mb-10 text-center">
        Welcome To The AI Text Summarizer!
      </h1>

      {/* Summary Display */}
      <div className="w-full max-w-3xl text-white text-lg leading-relaxed whitespace-pre-wrap">
        {summary || ""}
      </div>

      {summary && (
        <div className="w-full max-w-3xl text-white text-lg leading-relaxed whitespace-pre-wrap flex flex-col items-start">
          <button
            onClick={copyToClipboard}
            className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition cursor-pointer"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {/* Chat-style Input */}
      <div className="fixed bottom-8 w-full px-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          <div className="flex items-end bg-gray-500 border border-gray-500 rounded-xl shadow-md p-3">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (e.target.value.length <= MAX_CHAR_LIMIT) {
                  setError("");
                }
              }}
              placeholder="Input text here..."
              className="flex-1 bg-transparent resize-none outline-none placeholder-white text-white px-2 max-h-[200px] overflow-auto"
              rows={1}
              onInput={resizeTextarea}
            />
            {inputText.length <= MAX_CHAR_LIMIT && (
              <button
                onClick={handleSummarize}
                className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <ClipLoader size={20} color="#ffffff" />
                ) : (
                  "Summarize"
                )}
              </button>
            )}
          </div>

          {/* Optional: show input length and error */}
          <div className="flex justify-between text-sm text-white px-1">
            <span
              className={
                inputText.length > MAX_CHAR_LIMIT ? "text-red-400" : ""
              }
            >
              {inputText.length}/{MAX_CHAR_LIMIT}
            </span>
            {error && <span className="text-red-400">{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
