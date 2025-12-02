import { Contacts } from "../models/Contact.model.js";

// CREATE CONTACT
const createContacts = async (req, res) => {
  const { username, email, message } = req.body;

  try {
    if (!username || !email || !message) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const newContacts = await Contacts.create({
      username,
      email,
      message,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
      contacts: newContacts,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error occurred!", error });
  }
};

// GET ALL CONTACTS
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contacts.find();
    return res.status(200).json({ success: true, contacts });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching contacts!", error });
  }
};

// GET CONTACT BY ID
const getContactById = async (req, res) => {
  const { id } = req.params;

  try {
    const contact = await Contacts.findById(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found!" });
    }

    return res.status(200).json({ success: true, contact });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching contact!", error });
  }
};

// DELETE CONTACT BY ID
const deleteContactsById = async (req, res) => {
  const { id } = req.params;

  try {
    const contact = await Contacts.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found!" });
    }

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully!",
    });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting contact!", error });
  }
};

export {
  createContacts,
  getAllContacts,
  getContactById,
  deleteContactsById,
};
