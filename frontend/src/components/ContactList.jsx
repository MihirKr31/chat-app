// src/components/ContactList.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { fetchAllContacts, setSelectedUser } from "../store/chatSlice";

function ContactList() {
  const dispatch = useDispatch();
  const allContacts = useSelector((state) => state.chat.allContacts);
  const isUsersLoading = useSelector((state) => state.chat.isUsersLoading);
  const onlineUsers = useSelector((state) => state.auth.onlineUsers); // adjust path as per your auth slice

  useEffect(() => {
    dispatch(fetchAllContacts());
  }, [dispatch]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => dispatch(setSelectedUser(contact))}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers?.includes(contact._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{contact.fullName}</h4>
          </div>
        </div>
      ))}
    </>
  );
}

export default ContactList;
