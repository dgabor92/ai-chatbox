// renderer/src/App.tsx
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Camera } from "lucide-react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askLLM = async () => {
    setLoading(true);
    setResponse("");
    console.log("Sending prompt to Electron:", prompt);

    if (!prompt.trim()) {
      setResponse("Kérlek, írj be egy kérdést.");
      setLoading(false);
      return;
    }

    // ✅ Electron üzenetküldés
    if (window.electronAPI) {
      window.electronAPI.sendMessage(prompt);
    } else {
      // Ha nem Electron környezet (pl. böngésző), fallback API hívás
      const res = await fetch("http://localhost:5001/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResponse(data.result);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onReply((data: string) => {
        setResponse(data);
        setLoading(false);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-blue-400 font-mono flex flex-col border-gray-800">
      {/* 🔹 HEADER */}
      <header className="w-full p-4 flex justify-between items-center drag">
        <h1 className="text-xl text-white font-bold">💬 AI Chatbox</h1>
        <div className="flex items-center gap-4">
          <Camera
            className="text-white cursor-pointer"
            onClick={() => window.electronAPI?.startCapture()}
          />
          <input
            type="range"
            id="opacity"
            min="0.2"
            max="1"
            step="0.05"
            defaultValue="1"
            onChange={(e) =>
              window.electronAPI?.setOpacity(parseFloat(e.target.value))
            }
          />
        </div>
      </header>

      {/* 🔹 MAIN – 3 oszlop */}
      <main className="flex flex-1 p-4 gap-4">
        {/* KÉRDEZŐ */}
        <div className="w-1/3 border-white border p-4 rounded-xl">
          <h2 className="text-lg font-bold mb-2 text-white">🗣️ Kérdező</h2>
          <p className="text-sm text-gray-300">
            [ide jön majd a valós idejű szöveg]
          </p>
        </div>

        {/* VÁLASZ */}
        <div className="w-1/3 border-white border p-4 rounded-xl overflow-y-auto">
          <h2 className="text-lg font-bold mb-2 text-white">🗣️ Válaszoló</h2>
          <p className="text-sm text-gray-300">
            [ide jön majd a valós idejű szöveg]
          </p>
        </div>

        {/* JOBB OLDALI: 2 rész */}
        <div className="w-1/3 flex flex-col gap-4">
          <div className="flex-1 border-white border p-4 rounded-xl">
            <h2 className="text-lg font-bold mb-2 text-white">🤖 Válasz</h2>
            {loading ? (
              <div className="text-gray-400">💭 Gondolkodom...</div>
            ) : (
              <div className="whitespace-pre-wrap text-white">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            )}
          </div>
          <div className="border-white border p-4 rounded-xl">
            <textarea
              className="w-full p-2 text-white border-white border-1 rounded-xl"
              rows={4}
              placeholder="Írd ide a kérdésed..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={askLLM}
              className="mt-2 w-full bg-gray-600 px-4 py-2 rounded hover:bg-blue-300"
            >
              Küldés
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
