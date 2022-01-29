const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares");
const {
  validatePost,
  validatePut,
  validateFavorite,
} = require("../../validator");
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require("../../model/index");
router.get("/", auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, favorite } = req.query;
    if (page === "") {
      page = 1;
    }
    const contacts = await listContacts(limit, page, favorite);
    res.status(200).json({ contacts: contacts });
  } catch (error) {
    res.status(500).json(error);
  }
});
router.get("/:contactId", auth, async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);
    if (!contact) {
      res.status(404).json({ message: "Not Found" });
    } else {
      res.status(200).json(contact);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/", validatePost(), auth, async (req, res, next) => {
  try {
    const newContact = await addContact(req.body);
    res.status(201).json({ newContact: newContact });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:contactId", auth, async (req, res, next) => {
  try {
    const removedContact = await removeContact(req.params.contactId);
    if (!removedContact) {
      res.status(404).json({ message: "Not Found" });
    } else {
      res.status(200).json(removedContact);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.patch("/:contactId", validatePut(), auth, async (req, res, next) => {
  try {
    const updatedContact = await updateContact(req.params.contactId, req.body);
    if (!updatedContact) {
      res.status(404).json({ message: "Not Found" });
    } else {
      res.status(200).json({ updatedContact: updatedContact });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
router.patch(
  "/:contactId/favorite",
  auth,
  validateFavorite(),
  async (req, res, next) => {
    try {
      const updatedContact = await updateStatusContact(
        req.params.contactId,
        req.body
      );
      if (!updatedContact) {
        res.status(404).json({ message: "Not Found" });
      } else {
        res.status(200).json({ updatedContact: updatedContact });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

module.exports = router;
