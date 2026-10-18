import { CrmNote, User } from "../models/index.js";

// Notes are polymorphic: every note is attached to an entityType
// ("client" | "contact" | "company" | "requirement" | "contract" | "lead")
// + entityId, so the same endpoints power the Notes tab on any CRM record.

export const createNote = async (req, res) => {
  try {
    const { entityType, entityId, content, pinned } = req.body;
    if (!entityType || !entityId || !content) {
      return res.status(400).json({
        success: false,
        message: "entityType, entityId and content are required",
      });
    }

    const note = await CrmNote.create({
      entityType,
      entityId,
      content,
      pinned: !!pinned,
      createdBy: req.user?.id,
    });

    const withAuthor = await CrmNote.findByPk(note.id, {
      include: [{ model: User, as: "author", attributes: ["id", "name"] }],
    });

    res.status(201).json({ success: true, message: "Note added successfully", data: withAuthor });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add note", error: error.message });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    if (!entityType || !entityId) {
      return res.status(400).json({ success: false, message: "entityType and entityId are required" });
    }

    const notes = await CrmNote.findAll({
      where: { entityType, entityId },
      include: [{ model: User, as: "author", attributes: ["id", "name"] }],
      order: [["pinned", "DESC"], ["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notes", error: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await CrmNote.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }
    const { content, pinned } = req.body;
    await note.update({
      ...(content !== undefined ? { content } : {}),
      ...(pinned !== undefined ? { pinned } : {}),
    });
    res.status(200).json({ success: true, message: "Note updated successfully", data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update note", error: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await CrmNote.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }
    await note.destroy();
    res.status(200).json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete note", error: error.message });
  }
};
