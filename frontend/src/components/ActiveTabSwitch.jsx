// src/components/ActiveTabSwitch.jsx
import { useSelector, useDispatch } from "react-redux";
import { setActiveTab } from "../store/chatSlice";

function ActiveTabSwitch() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.chat.activeTab);

  return (
    <div className="tabs tabs-boxed bg-transparent p-2 m-2">
      <button
        onClick={() => dispatch(setActiveTab("chats"))}
        className={`tab ${
          activeTab === "chats"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-slate-400"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => dispatch(setActiveTab("contacts"))}
        className={`tab ${
          activeTab === "contacts"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-slate-400"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}

export default ActiveTabSwitch;
