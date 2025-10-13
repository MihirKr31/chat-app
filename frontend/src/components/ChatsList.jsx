// src/components/ChatsList.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { fetchChats, setSelectedUser } from "../store/chatSlice";

function ChatsList() {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);
  const isUsersLoading = useSelector((state) => state.chat.isUsersLoading);
  const onlineUsers = useSelector((state) => state.auth.onlineUsers); // adapt name/path per your auth slice

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (!chats.length) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => dispatch(setSelectedUser(chat))}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers?.includes(chat._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{chat.fullName}</h4>
          </div>
        </div>
      ))}
    </>
  );
}

export default ChatsList;
