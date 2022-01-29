const Contacts = require("./Contacts");
const listContacts = async (limit, page, favorite) => {
  if (favorite) {
    let contacts = await Contacts.find({ favorite: true }, null, {
      limit: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
    });
    return contacts;
  }
  let contacts = await Contacts.find(null, null, {
    limit: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
  });
  return contacts;
};

const getContactById = async (contactId) => {
  let contact = await Contacts.findById(contactId);
  if (!contact) {
    return false;
  } else {
    return contact;
  }
};

const removeContact = async (contactId) => {
  let contact = await Contacts.findById(contactId);
  if (!contact) {
    return false;
  } else {
    await Contacts.findByIdAndDelete(contactId);
    return { message: "contact deleted" };
  }
};

const addContact = async (body) => {
  let newContact = await Contacts.create(body);
  return newContact;
};

const updateContact = async (contactId, body) => {
  let target = await Contacts.findByIdAndUpdate(contactId, body, {
    new: true,
  });
  if (!target) {
    return false;
  } else {
    return target;
  }
};
const updateStatusContact = async (contactId, body) => {
  let target = await Contacts.findById(contactId);
  if (!target) {
    return false;
  }
  await Contacts.findByIdAndUpdate(contactId, body, {
    new: true,
  });
  return target;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
