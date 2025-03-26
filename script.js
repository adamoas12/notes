// Get the elements
const saveButton = document.getElementById("saveButton");
const noteNameInput = document.getElementById("noteName");
const noteTextInput = document.getElementById("noteText");
const noteList = document.getElementById("noteList");
const favoriteNoteList = document.getElementById("favoriteNoteList");
const searchInput = document.getElementById("searchNotes");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");
const mainContent = document.querySelector(".main-content");
const newNoteBtn = document.getElementById("newNoteBtn");

// Get overlay elements
const noteEditorOverlay = document.getElementById("noteEditorOverlay");
const overlayNoteTitle = document.getElementById("overlayNoteTitle");
const noteContent = document.getElementById("noteContent");
const editNoteContent = document.getElementById("editNoteContent");
const copyNoteBtn = document.getElementById("copyNoteBtn");
const editNoteBtn = document.getElementById("editNoteBtn");
const closeEditorBtn = document.getElementById("closeEditorBtn");
const viewMode = document.getElementById("viewMode");
const editMode = document.getElementById("editMode");
const saveEditBtn = document.getElementById("saveEditBtn");

let currentNoteIndex = -1;

// Load saved notes from localStorage
let savedNotes = JSON.parse(localStorage.getItem("samples")) || [];
// Convert existing notes to include favorite property if they don't have it
savedNotes = savedNotes.map(note => ({
    ...note,
    favorite: note.favorite || false
}));

renderNotes(savedNotes);

// Add search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredNotes = savedNotes.filter(note => 
        note.name.toLowerCase().includes(searchTerm) || 
        note.text.toLowerCase().includes(searchTerm)
    );
    renderNotes(filteredNotes);
});

// Add new note functionality
newNoteBtn.addEventListener("click", () => {
    noteNameInput.value = "";
    noteTextInput.value = "";
});

// Add auto-resize functionality for textarea
noteTextInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Function to generate auto title from note content
function generateAutoTitle(content) {
    // Get the first line or first few words
    const words = content.trim().split(/\s+/);
    const firstLine = content.split('\n')[0].trim();
    
    // If first line is short enough, use it as title
    if (firstLine.length <= 30) {
        return firstLine;
    }
    
    // Otherwise take first 3-5 words
    return words.slice(0, words.length > 4 ? 4 : 3).join(' ') + '...';
}

// Save the note
saveButton.addEventListener("click", () => {
    let noteName = noteNameInput.value.trim();
    const noteText = noteTextInput.value.trim();

    if (noteText) {
        // Generate auto title if user didn't provide one
        if (!noteName) {
            noteName = generateAutoTitle(noteText);
        }

        const newNote = { 
            name: noteName, 
            text: noteText,
            favorite: false 
        };
        savedNotes.push(newNote);
        localStorage.setItem("samples", JSON.stringify(savedNotes));
        renderNotes(savedNotes);

        // Clear input fields
        noteNameInput.value = "";
        noteTextInput.value = "";
    }
});

// Add sidebar toggle functionality
sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
    mainContent.classList.toggle("expanded");
});

// Delete a note
function deleteNote(index) {
    savedNotes.splice(index, 1);
    localStorage.setItem("samples", JSON.stringify(savedNotes));
    renderNotes(savedNotes);
}

// Toggle favorite status
function toggleFavorite(index) {
    savedNotes[index].favorite = !savedNotes[index].favorite;
    localStorage.setItem("samples", JSON.stringify(savedNotes));
    renderNotes(savedNotes);
}

// Overlay control functions
function openNoteEditor(note, index) {
    currentNoteIndex = index;
    overlayNoteTitle.textContent = note.name;
    noteContent.textContent = note.text;
    editNoteContent.value = note.text;
    noteEditorOverlay.classList.add("active");
    document.body.classList.add("overlay-active");
    viewMode.style.display = "block";
    editMode.classList.add("hidden");
}

function closeNoteEditor() {
    noteEditorOverlay.classList.remove("active");
    document.body.classList.remove("overlay-active");
    currentNoteIndex = -1;
}

// Event listeners for overlay buttons
copyNoteBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(noteContent.textContent).then(() => {
        const originalText = copyNoteBtn.innerHTML;
        copyNoteBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyNoteBtn.innerHTML = originalText;
        }, 1500);
    });
});

editNoteBtn.addEventListener("click", () => {
    viewMode.style.display = "none";
    editMode.classList.remove("hidden");
});

closeEditorBtn.addEventListener("click", closeNoteEditor);

saveEditBtn.addEventListener("click", () => {
    if (currentNoteIndex >= 0) {
        const updatedText = editNoteContent.value.trim();
        if (updatedText) {
            savedNotes[currentNoteIndex].text = updatedText;
            localStorage.setItem("samples", JSON.stringify(savedNotes));
            noteContent.textContent = updatedText;
            viewMode.style.display = "block";
            editMode.classList.add("hidden");
        }
    }
});

// Close overlay when clicking outside
noteEditorOverlay.addEventListener("click", (e) => {
    if (e.target === noteEditorOverlay) {
        closeNoteEditor();
    }
});

// Render the notes list
function renderNotes(notes) {
    // Clear both lists
    noteList.innerHTML = "";
    favoriteNoteList.innerHTML = "";

    notes.forEach((note, index) => {
        const noteItem = document.createElement("div");
        noteItem.classList.add("note-item");

        const noteTitle = document.createElement("div");
        noteTitle.classList.add("note-title");
        noteTitle.textContent = note.name;
        
        noteTitle.addEventListener("click", () => {
            openNoteEditor(note, index);
        });

        const noteActions = document.createElement("div");
        noteActions.classList.add("note-actions");

        const favoriteButton = document.createElement("button");
        favoriteButton.innerHTML = `<i class="fas fa-star"></i>`;
        favoriteButton.classList.add("favorite-btn");
        if (note.favorite) favoriteButton.classList.add("active");
        
        favoriteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(index);
        });

        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = `<i class="fas fa-times"></i>`;
        deleteButton.classList.add("delete-btn");
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteNote(index);
        });

        noteActions.appendChild(favoriteButton);
        noteActions.appendChild(deleteButton);
        noteItem.appendChild(noteTitle);
        noteItem.appendChild(noteActions);

        // Add to appropriate list
        if (note.favorite) {
            favoriteNoteList.appendChild(noteItem);
        } else {
            noteList.appendChild(noteItem);
        }
    });
}
