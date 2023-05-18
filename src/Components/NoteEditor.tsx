import { ChangeEvent, MouseEvent, useEffect, useRef } from "react";
import { FontsObject as FontsInterface, Notes as NotesInterface } from "./Home";
import {db, auth} from '../firebase-config'
import {doc, addDoc, updateDoc, collection, serverTimestamp} from 'firebase/firestore'
import xIcon from '../images/close.png'

interface NoteEditorProps {
    // Notes Array
    notes:NotesInterface[] | undefined;

    // SetNotes function
    setNotes:React.Dispatch<React.SetStateAction<NotesInterface[] | undefined>>;
    // Note ID
    noteId: string;

    // Note Index in the notes array
    noteIndex:number;

    setNoteId:React.Dispatch<React.SetStateAction<string>>;
    // Note Title
    noteTitle:string;
    setNoteTitle:React.Dispatch<React.SetStateAction<string>>;

    // Note
    noteContent:string;
    setNoteContent:React.Dispatch<React.SetStateAction<string>>;

    // Selected Font
    selectedFont:string;
    setSelectedFont:React.Dispatch<React.SetStateAction<string>>;

    // Font Size
    fontSize:number;
    setFontSize:React.Dispatch<React.SetStateAction<number>>;

    // Is the note font set as bold
    isBold:boolean | undefined;
    setIsBold:React.Dispatch<React.SetStateAction<boolean | undefined>>;

    // Is the note font set as italic
    isItalic:boolean | undefined;
    setIsItalic:React.Dispatch<React.SetStateAction<boolean | undefined>>;

    // Is the note text decoartion set as underline
    isUnderline:boolean | undefined;
    setIsUnderline:React.Dispatch<React.SetStateAction<boolean | undefined>>;

    // Fonts object
    fontFamilies:FontsInterface

    // The Variable which is used to decide whether to show the note or not
    showNote:boolean;
    setShowNote:React.Dispatch<React.SetStateAction<boolean>>;

    // This variable will be used to determine if the document was fetched from the database so the browser can decide whether to update an existing document or to create a new one
    fetchedFromDatabase:boolean | undefined;

    setFetchedFromDatabase:React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

const NoteEditor:React.FC<NoteEditorProps> = ({notes, setNotes, noteId, noteIndex, setNoteId, noteTitle, setNoteTitle, noteContent, setNoteContent, selectedFont, setSelectedFont, fontSize, setFontSize, isBold, setIsBold, isItalic, setIsItalic, isUnderline, setIsUnderline, fontFamilies, setShowNote, fetchedFromDatabase, setFetchedFromDatabase }) =>  {

    useEffect(() => {
      console.log(notes)
        const textarea = document.querySelector('.note-content')

        // These if statements check if the saved note had these font styles
        if(isBold && textarea !== null){
          document.querySelector('#bold')?.classList.add('active-font-style')
          textarea.classList.add("bold")
        } 
        if(isItalic && textarea !== null){
          document.querySelector('#italic')?.classList.add('active-font-style')
          textarea.classList.add("italic")
        }  
        if(isUnderline && textarea !== null){
          document.querySelector('#underline')?.classList.add('active-font-style')
          textarea.classList.add("underline")
        }
        if(fontSize !== 12 && textarea !== null){
          textarea.classList.remove('fontSize12')
          textarea.classList.add(`fontSize${fontSize}`)
        }
    }, [])

    // This variable will store the initial value of the note so when the user changes the note text the browser will check if the two are the same. If so the save button will be hidden if not the save button will be shown
    const initialNoteContent = useRef<string>()
    const initialNoteTitle = useRef<string>()
    initialNoteContent.current = noteContent
    initialNoteTitle.current = noteTitle
    const saveBtn = document.querySelector('.save-btn')

    function handleNoteTitleChange(e:ChangeEvent<HTMLInputElement>){
      setNoteTitle(e.target.value)
      if(e.target.value === initialNoteTitle.current){
        saveBtn?.classList.remove('active-save-btn')
      }else{
        saveBtn?.classList.add('active-save-btn')
      }
    }

    function handleNoteChange(e:ChangeEvent<HTMLTextAreaElement>){
        setNoteContent(e.target.value)
        if(e.target.value === initialNoteContent.current){
          saveBtn?.classList.remove('active-save-btn')
        }else{
          saveBtn?.classList.add('active-save-btn')
        }
      }
  
      function handleFontChange(e:ChangeEvent<HTMLSelectElement>){
        const newFont:string = fontFamilies[e.target.value];

        const textarea:HTMLTextAreaElement | null = document.querySelector('.note-content')

        textarea !== null ? textarea.style.fontFamily = newFont : ''
        setSelectedFont(fontFamilies[newFont])
      }
  
      function handleFontSizeChange(e:ChangeEvent){
        const {value} = e.target as HTMLSelectElement
        const parsedValue = parseInt(value)
        
        const textarea = document.querySelector('.note-content')
        textarea?.classList.add(`fontSize${parsedValue}`)
        
        if(textarea !== null && textarea.classList.length > 1){
          textarea.classList.remove(`fontSize${fontSize}`)
        }
        setFontSize(parsedValue)
      }
  
      function handleFontStyleChange(e:MouseEvent){
  
        const button = e.target as HTMLButtonElement
        const { id } = e.target as HTMLButtonElement
        const textArea = document.querySelector('.note-content')
       
        if(id === 'bold'){
          setIsBold(prev => {
  
            if(prev === false){
              button.classList.add('active-font-style')
              textArea?.classList.add('bold')
              setIsBold(true)
              return;
            }
              button.classList.remove('active-font-style')
              textArea?.classList.remove('bold')
              setIsBold(false)
              return !prev
          })
          
        }else if(id === 'italic'){
          setIsItalic(prev => {
  
            if(prev === false){
              button.classList.add('active-font-style')
              textArea?.classList.add('italic')
              setIsItalic(true)
              return;
            }
    
            button.classList.remove('active-font-style')
            textArea?.classList.remove('italic')
            setIsItalic(false)
  
            return !prev
          })
          
        }else if(id === 'underline'){
          setIsUnderline(prev =>{
            
            if(prev === false){
              button.classList.add('active-font-style')
              textArea?.classList.add('underline')
              setIsUnderline(true)
              return;
            }
            
            button.classList.remove('active-font-style')
            textArea?.classList.remove('underline')
            setIsUnderline(false)
            return !prev
          })
        }
      }

      function closeNote() {
        setShowNote(false)
      }

      // This function checks if the note already exists on the database, if so it will update that existing document. Otherwise it will create a new document
      async function saveNote(){

        if(fetchedFromDatabase && auth.currentUser !== null){
          saveBtn?.classList.remove('active-save-btn')
          const docRef = doc(db, 'notes', noteId)
          await updateDoc(docRef, {
            userId:auth.currentUser.uid,
            userEmail:auth.currentUser.email,
            noteTitle,
            noteContent,
            isBold,
            isItalic,
            isUnderline,
            fontFamily:selectedFont,
            fontSize,
            lastUpdatedAt:new Date()
          })

        }else if(!fetchedFromDatabase && auth.currentUser !== null){
          saveBtn?.classList.remove('active-save-btn')
          const notesCollection = collection(db, 'notes')
          await addDoc(notesCollection, {
            userId:auth.currentUser.uid,
            userEmail:auth.currentUser.email,
            noteTitle,
            noteContent,
            isBold,
            isItalic,
            isUnderline,
            fontFamily:selectedFont,
            fontSize,
            createdAt:serverTimestamp(),
            lastUpdatedAt:serverTimestamp()
          }).then(res => setNoteId(res.id))
          setFetchedFromDatabase(true)
        }
      }

  return (
    <div className="note-editor">
        <div className="text-transform-options">

          {/* Font Family */}
          <div className="font-family">
            <select className="font-family-select" onChange={e => handleFontChange(e)}>
              <option value="come">Come</option>
              <option value="timesNewRoman">Times New Roman</option>
              <option value="courier">Courier New</option>
              <option value="franklin">Franklin Gothic Medium</option>
              <option value="segoe">Segoe UI</option>
              <option value="georgia">Georgia</option>
            </select>
          </div>

          {/* Font Size */}
          <div className="font-size">
            <select className='font-size-select' value={fontSize} onChange={e => handleFontSizeChange(e)}>
              <option>10</option>
              <option>12</option>
              <option>14</option>
              <option>16</option>
              <option>18</option>
              <option>20</option>
              <option>22</option>
              <option>24</option>
              <option>26</option>
              <option>28</option>
              <option>30</option>
              <option>32</option>
              <option>34</option>
              <option>36</option>
              <option>38</option>
              <option>40</option>
            </select>
          </div>

          {/* Font Style */}
          <div className="font-style">
              <button onClick={(e) => handleFontStyleChange(e)} className="font-style-btns" id="bold">B</button>
              <button onClick={(e) => handleFontStyleChange(e)} className="font-style-btns" id="italic">I</button>
              <button onClick={(e) => handleFontStyleChange(e)} className="font-style-btns" id="underline">U</button>
          </div>
        </div>

        {/* This buttons hides the note */}
        <button className="close-note-btn" onClick={() => closeNote()}><img src={xIcon}/></button>

        {/*  */}
        <div className="expanded-note">
          <div className="title-wrapper">
            <input className="expanded-note-title" placeholder='Note title' value={noteTitle} onChange={e => handleNoteTitleChange(e)}/>
          </div>

          <div className="note-wrapper">
            <textarea className="note-content fontSize12" placeholder='Note' value={noteContent} onChange={e => handleNoteChange(e)}></textarea>
            {!fetchedFromDatabase ? <button className="save-btn active-save-btn" onClick={() => saveNote()}>Save</button>:
              <button className="save-btn" onClick={() => saveNote()}>Save</button>}
          </div>
        </div>
      </div>

  )
}

export default NoteEditor;