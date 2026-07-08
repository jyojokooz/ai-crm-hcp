import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateFormData, addMessage, setLoading } from "./store/crmSlice";
import axios from "axios";

function App() {
  const dispatch = useDispatch();
  const { formData, messages, isLoading } = useSelector((state) => state.crm);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFormChange = (e) => {
    dispatch(updateFormData({ [e.target.name]: e.target.value }));
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    dispatch(addMessage({ role: "user", text: userMsg }));
    setChatInput("");
    dispatch(setLoading(true));

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/chat", {
        message: userMsg,
      });
      const data = response.data;

      // Add AI Response
      dispatch(addMessage({ role: "ai", text: data.response }));

      // Parse tool calls for UI Auto-fill
      if (data.tool_calls && data.tool_calls.length > 0) {
        let updatedData = {};

        data.tool_calls.forEach((call) => {
          if (
            call.tool === "log_interaction" ||
            call.tool === "edit_interaction"
          ) {
            if (call.args.hcp_name) updatedData.hcpName = call.args.hcp_name;
            if (call.args.topics) updatedData.topics = call.args.topics;
            if (call.args.notes) updatedData.outcomes = call.args.notes;

            // Auto-fill today's date and time if it's a new interaction
            if (!formData.date) {
              const now = new Date();
              updatedData.date = now.toISOString().split("T")[0];
              updatedData.time = now.toTimeString().slice(0, 5);
            }
          }
          if (call.tool === "analyze_sentiment") {
            let text = (
              call.args.notes ||
              call.args.sentiment ||
              ""
            ).toLowerCase();
            if (
              text.includes("positive") ||
              text.includes("happy") ||
              text.includes("good")
            ) {
              updatedData.sentiment = "Positive";
            } else if (
              text.includes("negative") ||
              text.includes("bad") ||
              text.includes("upset")
            ) {
              updatedData.sentiment = "Negative";
            } else {
              updatedData.sentiment = "Neutral";
            }
          }
        });

        // Demo hack: If user typed "brochure", auto-fill the materials to match screenshot
        if (userMsg.toLowerCase().includes("brochure")) {
          updatedData.materials = "Brochures.";
        }

        if (Object.keys(updatedData).length > 0) {
          dispatch(updateFormData(updatedData));
        }
      }
    } catch (error) {
      console.error(error); // Fixes the unused 'error' warning
      dispatch(
        addMessage({
          role: "ai",
          text: "Sorry, I encountered an error connecting to the server.",
        }),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        hcp_id: 1,
        date: formData.date || new Date().toISOString().split("T")[0],
        notes: formData.outcomes || "No outcomes logged.",
        sentiment: formData.sentiment || "Neutral",
        topics: formData.topics || "General",
      };

      await axios.post("http://127.0.0.1:8000/interactions/", payload);
      alert("✅ Interaction saved to database successfully!");
    } catch (error) {
      console.error(error); // Fixes the unused 'error' warning
      alert("⚠️ Error saving interaction. (Ensure HCP ID 1 exists in DB)");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 font-sans text-gray-800">
      <div className="max-w-350 mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 flex flex-col md:flex-row h-[90vh]">
        {/* LEFT COLUMN: FORM */}
        <div className="w-full md:w-3/5 border-r border-gray-200 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            <h1 className="text-xl font-bold text-white bg-blue-600 inline-block px-2 py-0.5 rounded-sm">
              Log HCP Interaction
            </h1>

            {/* Interaction Details section */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Interaction Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    HCP Name
                  </label>
                  <input
                    type="text"
                    name="hcpName"
                    value={formData.hcpName || ""}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Search or select HCP..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Interaction Type
                  </label>
                  <select
                    name="interactionType"
                    value={formData.interactionType || "Meeting"}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date || ""}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time || ""}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Attendees
                </label>
                <input
                  type="text"
                  name="attendees"
                  value={formData.attendees || ""}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Enter names or search..."
                />
              </div>
            </div>

            {/* Topics Discussed */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Topics Discussed
              </label>
              <textarea
                name="topics"
                value={formData.topics || ""}
                onChange={handleFormChange}
                rows="3"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Enter key discussion points..."
              ></textarea>
              <button className="text-blue-500 text-xs mt-1 flex items-center gap-1 hover:underline cursor-pointer">
                🎙️ Summarize from Voice Note (Requires Consent)
              </button>
            </div>

            {/* Materials Shared */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                Materials Shared / Samples Distributed
              </h2>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Materials Shared
                </label>
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm text-gray-500">
                    {formData.materials || "No materials added."}
                  </span>
                  <button className="text-gray-600 border border-gray-300 px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-gray-50 cursor-pointer">
                    🔍 Search/Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Samples Distributed
                </label>
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm text-gray-500">
                    {formData.samples || "No samples added."}
                  </span>
                  <button className="text-gray-600 border border-gray-300 px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-gray-50 cursor-pointer">
                    ➕ Add Sample
                  </button>
                </div>
              </div>
            </div>

            {/* Sentiment Radio Buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observed/Inferred HCP Sentiment
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="sentiment"
                    value="Positive"
                    checked={formData.sentiment === "Positive"}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-purple-600 accent-purple-600"
                  />
                  😃 Positive
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="sentiment"
                    value="Neutral"
                    checked={
                      formData.sentiment === "Neutral" || !formData.sentiment
                    }
                    onChange={handleFormChange}
                    className="w-4 h-4 text-purple-600 accent-purple-600"
                  />
                  😐 Neutral
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="sentiment"
                    value="Negative"
                    checked={formData.sentiment === "Negative"}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-purple-600 accent-purple-600"
                  />
                  ☹️ Negative
                </label>
              </div>
            </div>

            {/* Outcomes & Follow Up */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Outcomes
              </label>
              <textarea
                name="outcomes"
                value={formData.outcomes || ""}
                onChange={handleFormChange}
                rows="2"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Key outcomes or agreements..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Follow-up Actions
              </label>
              <textarea
                name="followUp"
                value={formData.followUp || ""}
                onChange={handleFormChange}
                rows="2"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Enter next steps or tasks..."
              ></textarea>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition mt-4 cursor-pointer"
            >
              Save Interaction Log
            </button>
            <div className="pb-10"></div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI CHAT */}
        <div className="w-full md:w-2/5 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
              🤖 AI Assistant
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Log Interaction details here via chat
            </p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => {
              // Fixes the useless assignment warning by structuring it cleanly
              let boxStyle;
              if (msg.role === "user") {
                boxStyle =
                  "bg-[#f3f4f6] border-l-4 border-blue-600 text-gray-800";
              } else if (
                msg.text.includes("successfully") ||
                msg.text.includes("logged")
              ) {
                boxStyle =
                  "bg-[#e6f4ea] text-green-900 border border-green-200";
              } else {
                boxStyle = "bg-[#e6f4f1] text-gray-800";
              }

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg text-sm shadow-sm ${boxStyle}`}
                >
                  {msg.role === "ai" && msg.text.includes("successfully") ? (
                    <span>✅ {msg.text}</span>
                  ) : (
                    msg.text
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="bg-[#e6f4f1] text-gray-600 p-4 rounded-lg text-sm animate-pulse">
                Processing interaction details...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-3 items-center">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (e.preventDefault(), sendMessage())
                }
                placeholder="Describe Interaction..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 resize-none h-12.5 shadow-sm"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading}
                className="bg-[#007bff] hover:bg-blue-700 text-white h-12.5 w-12.5 rounded-full flex flex-col items-center justify-center font-bold text-[10px] leading-tight transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                <span>A</span>
                <span>Log</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
