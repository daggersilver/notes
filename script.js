document.addEventListener("DOMContentLoaded", ()=>{
    const noteTitle = document.querySelector(".note-title");
    const noteText = document.querySelector(".note-text");
    const addNote = document.querySelector(".add-note");
    const noteTab = document.querySelector(".note-list");
    const editNote = document.querySelector(".edit-note");
    const deleteNote = document.querySelector(".delete-note");

    //set localstorage for the first time
    if(!localStorage.getItem("note-list")) {
        let data = {
            current: null,
            notes: []
        }
        localStorage.setItem("note-list", JSON.stringify(data));
    }

    //update display on initial page load
    updateDisplay();


    //check for click on add note
    addNote.addEventListener("click", () => {
        addANote();
    })

    noteTab.addEventListener("click", ()=>{
        //create a note menu
        const tileMenu = document.createElement("div");
        tileMenu.classList.add("note-tabs");

        //get notes from localStorage
        let localData = JSON.parse(localStorage.getItem("note-list"));

        localData.notes.forEach(noteData => {
            let note = document.createElement("div");
            note.classList.add("note-tile");

            //highlight the current note in display
            if(noteData.id == localData.current.id) {
                console.log("you")
                note.classList.add("current-note-border");
            }

            const MAX_LEN = 80;
            let textContent = noteData.text.length > MAX_LEN ? noteData.text.slice(0, MAX_LEN) + "  ..." : noteData.text

            note.innerHTML = `
                <p class="tile-title">${noteData.title}</p>
                <p class="tile-text">${textContent}</p>`;

            //check for click to display the note
            note.addEventListener("click", ()=>{
                //set current in localstorage
                let localData = JSON.parse(localStorage.getItem("note-list"));
                localData.current = noteData;

                localStorage.setItem("note-list", JSON.stringify(localData));

                //remove menu
                document.body.removeChild(tileMenu);

                //update display
                updateDisplay();
            })

            //append note element to menu element
            tileMenu.appendChild(note);
        });

        //check for zero notes
        console.log(localData.current)
        if(!localData.current) {
            let tempNode = document.createElement("div");
            tempNode.innerHTML = `
                    <p class="notetab-warning">No notes to show\nGo back</p>
                    <button class="go-back-tab">Go Back</button>`
            

            let goBack = tempNode.querySelector("button");
            goBack.addEventListener("click", ()=>{
                document.body.removeChild(tileMenu);
            })
                    
            tileMenu.appendChild(tempNode);
        }

        //add note menu to body
        document.body.appendChild(tileMenu);
    })

    editNote.addEventListener("click", ()=>{
        let currentNote = JSON.parse(localStorage.getItem("note-list")).current;

        addANote(currentNote.id, currentNote.title, currentNote.text);
    })

    deleteNote.addEventListener("click", ()=>{
        let localData = JSON.parse(localStorage.getItem("note-list"));
        let currentNote = localData.current;

        const popup = `
            <div class="background-layer">
                <div class="top-layer animate-popup">
                    <p class="layer-title">Delete Note</p>
                    <p class="confirm-delete-text">Are you sure to delete the note titled: "<b>${currentNote.title}</b>"</p>
                    <div class="layer-btn">
                        <button class="note-btn note-btn-cancel green"><i class="fas fa-times"></i></button>
                        <button class="note-btn note-btn-delete red"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            </div>`;
        
        const newNode = document.createElement("div");
        newNode.innerHTML = popup;
        document.body.appendChild(newNode);

        //cancel 
        let cancelBtn = document.querySelector(".note-btn-cancel");
        cancelBtn.addEventListener("click", ()=>{
            removePopup(document.body, newNode);
        });

        //delete
        let deleteBtn = document.querySelector(".note-btn-delete");
        deleteBtn.addEventListener("click", ()=>{
            let newData = {
                current: null,
                notes: []
            };

            localData.notes.forEach((noteData) => {
                if(noteData.id != currentNote.id) {
                    newData.notes.push(noteData);
                }
            })

            if(newData.notes.length)
                newData.current = newData.notes[0];

            localStorage.setItem("note-list", JSON.stringify(newData));

            //remove popup window
            removePopup(document.body, newNode);

            //update display
            updateDisplay();
        })
    })

    function addANote(id=null, title=null, text=null) {
        const origNoteTitle = title ? title : "";
        const origNoteText = text ? text : "";

        const popup = `
            <div class="background-layer">
                <div class="top-layer animate-popup">
                    <p class="layer-title">Add Note</p>
                    <input type="text" name="title-input" id="title-input" placeholder="title" autocomplete=off value="${origNoteTitle}" required>
                    <textarea name="text-input" id="text-input" cols="30" rows="10" placeholder="full note" required>${origNoteText}</textarea>
                    <div class="layer-btn">
                        <button class="note-btn note-btn-cancel red"><i class="fas fa-times"></i></button>
                        <button class="note-btn note-btn-add green"><i class="fas fa-check"></i></button>
                    </div>
                </div>
            </div>`

        const newNode = document.createElement("div");
        newNode.innerHTML = popup;
        document.body.appendChild(newNode);

        //title and text inputs
        let titleInput = document.getElementById("title-input");
        let textInput = document.getElementById("text-input");

        //focus on title input field
        titleInput.focus();
        titleInput.select();

        //cancel 
        let cancelBtn = document.querySelector(".note-btn-cancel");
        cancelBtn.addEventListener("click", ()=>{
            removePopup(document.body, newNode);
        });

        //add note
        let addNoteBtn = document.querySelector(".note-btn-add");
        addNoteBtn.addEventListener("click", ()=>{

            if(!titleInput.value || !textInput.value) {
                alert("Enter both title and text of the note.");
                removePopup(document.body, newNode);
                return;
            }

            //get localStorage data
            let localData = JSON.parse(localStorage.getItem("note-list"));

            //create new note
            let note = {
                id: id ? id : uuid.v4(),
                title: titleInput.value,
                text: textInput.value
            }
            //add note to data
            let newData;
            if(id){
                newData = {
                    current: note,
                    notes: []
                }

                //if editing a note, look for the note to replace
                localData.notes.forEach((noteData) => {
                    if(noteData.id == id) {
                        newData.notes.push(note);
                    }
                    else {
                        newData.notes.push(noteData);
                    }
                })
            }
            else{
                newData = {
                    current: note,
                    notes: [...localData.notes, note]
                }
            }

            //set data in localstorage
            localStorage.setItem("note-list", JSON.stringify(newData));

            //clear input fields
            textInput.value = "";
            titleInput.value = "";

            //remove popup window
            removePopup(document.body, newNode);

            //update display
            updateDisplay();
        })
    }

    function removePopup(parent, node) {
        parent.removeChild(node);
    }

    function updateDisplay() {
        //get data from local storage
        let localData = JSON.parse(localStorage.getItem("note-list"));

        if(!localData.current) {
            noteTitle.innerText = "No notes here";
            noteText.innerText = "add some notes.";
            noteTitle.style.color = "red";
        }
        else {
            noteTitle.innerText = localData.current.title;
            noteText.innerText = localData.current.text;
            noteTitle.style.color = "black";
        }
    }
})
