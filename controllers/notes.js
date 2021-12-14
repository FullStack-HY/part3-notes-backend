const notesRouter = require("express").Router();
const Note = require("../models/note");

notesRouter.get("/", (request, response) => {
    Note.find({}).then((notes) => {
        response.json(notes.map((note) => note.toJSON()));
    });
});


notesRouter.post("/", async (request, response, next) => {

    const body = request.body;

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    });

    const savedNote = await note.save();
    response.json(savedNote);
});

notesRouter.get("/:id", async (request, response, next) => {
    const note = await Note.findById(request.params.id);
    if (note) {
        response.json(note);
    } else {
        response.status(404).end();
    }
});

notesRouter.delete("/:id", async (request, response) => {
    await Note.findByIdAndRemove(request.params.id);
    response.status(204).end();
});

notesRouter.put("/:id", (request, response, next) => {
    const body = request.body;

    const note = {
        content: body.content,
        important: body.important,
    };

    Note.findByIdAndUpdate(request.params.id, note, { new: true })
        .then((updatedNote) => {
            response.json(updatedNote.toJSON());
        })
        .catch((error) => next(error));
});

module.exports = notesRouter;
