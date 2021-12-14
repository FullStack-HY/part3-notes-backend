const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const Note = require("../models/note");
const initialNotes = [
    {
        content: "HTML is easy",
        date: new Date(),
        important: false,
    },
    {
        content: "Browser can execute only Javascript",
        date: new Date(),
        important: true,
    },
];
beforeEach(async () => {
    await Note.deleteMany({});
    let noteObject = new Note(helper.initialNotes[0]);
    await noteObject.save();
    noteObject = new Note(helper.initialNotes[1]);
    await noteObject.save();
});

test("notes are returned as json", async () => {
    await api
        .get("/api/notes")
        .expect(200)
        .expect("Content-Type", /application\/json/);
}, 100000);
test("all notes are returned", async () => {
    const response = await api.get("/api/notes");

    expect(response.body).toHaveLength(helper.initialNotes.length);
}, 100000);

test("a specific note is within the returned notes", async () => {
    const response = await api.get("/api/notes");

    const contents = response.body.map((r) => r.content);
    expect(contents).toContain("Browser can execute only Javascript");
}, 100000);
test("a valid note can be added", async () => {
    const newNote = {
        content: "async/await simplifies making async calls",
        important: true,
    };

    await api
        .post("/api/notes")
        .send(newNote)
        .expect(200)
        .expect("Content-Type", /application\/json/);

    const notesAtEnd = await helper.notesInDb();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);

    const contents = notesAtEnd.map((n) => n.content);
    expect(contents).toContain("async/await simplifies making async calls");
});
test("note without content is not added", async () => {
    const newNote = {
        important: true,
    };

    await api.post("/api/notes").send(newNote).expect(400);

    const notesAtEnd = await helper.notesInDb();

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
});
afterAll(() => {
    mongoose.connection.close();
});
