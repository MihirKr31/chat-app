import Message from "../models/Messages.js";
import User from "../models/User.js";
import cloudinary from '../lib/cloudinary.js'

export async function saveMessageToDb({ senderId, receiverId, text, image }) {
  let imageUrl;
  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image);
    imageUrl = uploadResponse.secure_url;
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    text,
    image: imageUrl,
  });

  return await newMessage.save();
}


export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get contacts", error: error.message });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const chatPartnerId = req.params.id;
    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId, receiverId: chatPartnerId },
        { senderId: chatPartnerId, receiverId: loggedInUserId },
      ],
    });

    res.status(200).json(messages);
   } 
  catch (error) {
        res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const { text, image } = req.body; 

    if (!text && !image) {
      return res.status(400).json({ message: 'Message must contain text or an image.' });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: 'Sender and receiver cannot be the same user.' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver user not found.' });
    }

    const newMessage = await saveMessageToDb({senderId,receiverId,text,image})

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId },
        { receiverId: loggedInUserId }
      ]
    }).sort({ createdAt: -1 });

    // Collect unique partner IDs
    const partnerIds = new Set();
    messages.forEach(msg => {
      if (msg.senderId.toString() !== loggedInUserId.toString()) {
        partnerIds.add(msg.senderId.toString());
      }
      if (msg.receiverId.toString() !== loggedInUserId.toString()) {
        partnerIds.add(msg.receiverId.toString());
      }
    });

    const partners = await User.find({ _id: { $in: Array.from(partnerIds) } }).select('-password');

    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get chat partners', error: error.message });
  }
};