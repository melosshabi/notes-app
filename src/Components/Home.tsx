import {useEffect, useState} from 'react'
import { auth, db } from '../firebase-config'
import { collection, getDocs, query, where, orderBy, doc, deleteDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
// Components
import NoteEditor from './NoteEditor'
// Functions
import removeQuotationMarks from '../functions/removeQuotationMarks'
import resolveMonth from '../functions/resolveMonth'
// Icons
import userIcon from '../images/user.svg'
import plusIcon from '../images/plus.svg'
// CSS
import "../Styles/Home.css"
import "../Styles/NoteEditor.css"
import "../Styles/NoteDeletedNotif.css"
import "../Styles/Modal.css"

export interface FontsObject {
  [key: string]: string
}

export interface Notes {
  userId: string;
  userEmail:string;
  // Note ID is the firebase document ID
  noteId:string;
  createdAt:any;
  lastUpdatedAt:any;
  noteTitle:string;
  noteContent:string;
  isBold:boolean;
  isItalic:boolean;
  isUnderline:boolean;
  fontFamily:string;
  fontSize:number;
  fetchedFromDatabase:boolean;
}
export default function Home() {

    const [notes, setNotes] = useState<Notes[]>()
    const navigate = useNavigate()
    useEffect(() => {
      auth.onAuthStateChanged(async () => {
        if(auth.currentUser !== null){
          const notesCollection = collection(db, 'notes')
          const notesQuery = query(notesCollection, where('userId', '==', auth.currentUser.uid), orderBy('lastUpdatedAt', 'desc'))
          const querySnapshot = await getDocs(notesQuery)
          
          let notesArr:Notes[] = []
          querySnapshot.forEach(doc => {
            notesArr.push({userId:doc.data().userId, userEmail:doc.data().userEmail, noteId:doc.id, createdAt:doc.data().createdAt, 
                          lastUpdatedAt:doc.data().lastUpdatedAt,noteTitle:doc.data().noteTitle, noteContent:doc.data().noteContent, isBold:doc.data().isBold, isItalic:doc.data().isItalic, 
                          isUnderline:doc.data().isUnderline, fontFamily:doc.data().fontFamily, fontSize:doc.data().fontSize, fetchedFromDatabase:true})
          })
            setNotes(notesArr)
          }else navigate('/signIn')
      })
    }, [])

    const fontFamilies:FontsObject = {
      come:"'Comme', sans-serif",
      timesNewRoman: "'Times New Roman', Times, serif",
      courier:"'Courier New', Courier, monospace",
      franklin:"'Franklin Gothic Medium', sans-serif",
      georgia:'Georgia',
      segoe:'Segoe UI',
    }

    // Note ID is the firebase document ID
    const [noteId, setNoteId] = useState<string>('')
    // noteIndex is the note's index in the notes array
    const [noteIndex, setNoteIndex] = useState<number>(0)
    const [noteTitle, setNoteTitle] = useState<string>('')
    const [noteContent, setNoteContent] = useState<string>('')
    const [selectedFont, setSelectedFont] = useState<string>(fontFamilies.come)
    const [fontSize, setFontSize] = useState<number>(12)
    const [isBold, setIsBold] = useState<boolean | undefined>(false)
    const [isItalic, setIsItalic] = useState<boolean | undefined>(false)
    const [isUnderline, setIsUnderline] = useState<boolean | undefined>(false)
    const [showNote, setShowNote] = useState<boolean>(false)
    // This variable will be used to determine if the document was fetched from the database so the browser can decide whether to update an existing document or to create a new one
    const [fetchedFromDatabase, setFetchedFromDatabse] = useState<boolean | undefined>(undefined)

    // noteId is the document id stored on firestore, index is the note's index in the notes array
    const handleShowNote = (noteId:string, index:number, noteTitle:string, noteContent:string, fontSize:number, fontFamily:string, isBold:boolean, isItalic:boolean, isUnderline:boolean, fetchedFromDatabase:boolean):void =>{
      
      setShowNote(false)

      setTimeout(() => {
      setNoteId(noteId)
      setNoteIndex(index)
      setNoteTitle(noteTitle)
      setNoteContent(noteContent)
      setFontSize(fontSize)
      setSelectedFont(fontFamily)
      setIsBold(isBold)
      setIsItalic(isItalic)
      setIsUnderline(isUnderline)
      setFetchedFromDatabse(fetchedFromDatabase)
      setShowNote(true)}, 10)
    }

    function createNote(){
      
      if(auth.currentUser !== null && auth.currentUser.email !== null){

        const userId = auth.currentUser.uid;
        const userEmail = auth.currentUser.email
        const date = new Date()
        const year = date.getFullYear()
        const month = resolveMonth(date.getMonth())
        const day = date.getDate()
        const hours = date.getHours()
        const minutes = date.getMinutes()

        let tempArr = [...(notes !== undefined ? notes : [])]
        tempArr.push({
          userId: userId,
          userEmail: userEmail,
          noteTitle: `Note ${notes !== undefined ? notes.length += 1 : 1}`,
          noteContent: '',
          fontSize: 12,
          isBold: false,
          isItalic: false,
          isUnderline: false,
          fetchedFromDatabase: false,
          noteId: '',
          createdAt: {year, month, day, hours, minutes},
          lastUpdatedAt:{year, month, day, hours, minutes},
          fontFamily: fontFamilies.come
        })
        setNotes(tempArr)
        
      }
    }
  
    function resolveDate(date:Date){
      const year = date.getFullYear()
      let month = resolveMonth(date.getMonth());
      const day = date.getDate()
      const hours = date.getHours()
      const minutes = date.getMinutes()

      return {day, month, year, hours, minutes}
  }

  function showMoreOptions(index:number){
    document.querySelectorAll('.delete-note-btn')[index].classList.toggle('active-delete-note-btn')
  }

  // This variable will contain the document ID of the note that's stored on the database
  const [noteIdToDelete, setNoteIdToDelete] = useState<string>('')
  // This variable will contain the note index in the notes array
  const [noteIndexToDelete, setNoteIndexToDelete] = useState<number>(0)
  const [noteTitleToDelete, setNoteTitleToDelete] = useState<string>('')
  // This variable is used to trigger a rerender when a note is deleted but the NoteEditor is not rendered yet
  const [reRender, setRerender] = useState<boolean>(false)
  // This function sets the document id of the note that is going to be deleted and shows the modal

  function preDelete(noteId:string, noteIndex:number, noteTitle:string){
    document.querySelector('.modal')?.classList.add('active-modal')
    setNoteIdToDelete(noteId)
    setNoteIndexToDelete(noteIndex)
    setNoteTitleToDelete(noteTitle)
  }
  // This function shows the modal before deleting the note
  async function deleteNote(){
    document.querySelector('.modal')?.classList.remove('active-modal')

    const deletedNoteNotifsWrapper = document.querySelector('.note-deleted-wrapper') as HTMLDivElement

    const noteDeleted = document.createElement('div')
    const h3 = document.createElement('h3')
    const animationDiv = document.createElement('div')
    
    noteDeleted.classList.add('note-deleted')
    h3.innerText = "Note Deleted Successfully"
    animationDiv.classList.add('animation-div')
    
    noteDeleted.append(h3)
    noteDeleted.append(animationDiv)
    deletedNoteNotifsWrapper.prepend(noteDeleted)
    setTimeout(() => noteDeleted.classList.add('active-note-deleted'), 500)
    setTimeout(() => noteDeleted.classList.remove('active-note-deleted'), 3500)
    setTimeout(() => noteDeleted.remove(), 3900)

    let tempArr = notes
    tempArr?.splice(noteIndexToDelete, 1)
    setNotes(tempArr)
    // The reason I used both shownote and reRender variables is that when the 'notEditor' is unrendered after setting 'showNote' to false triggers a rerender
    // but when the 'noteEditor' is not rendered changing 'showNote' won't trigger a rerender therefore I used 'reRender' to trigger a rerender
    setShowNote(false)
    setRerender(true)

    // The code below will delete the note from the database
    const noteRef = doc(db, 'notes', noteIdToDelete)
    await deleteDoc(noteRef)
  }

  useEffect(() => setRerender(false), [reRender])

  return (
    <div className="home-wrapper">

      {/* This div shows a modal to the user to make sure that they want to Delete the note */}
      <div className="modal">
        <h2>Are you sure you want to delete Note {noteTitleToDelete}</h2>
        <div className='modal-btns-wrapper'>
          <button className='modal-btns' onClick={() => {
            document.querySelector('.modal')?.classList.remove('active-modal')}}>No</button>
            <button className='modal-btns' onClick={() => {deleteNote()}}>Yes</button>
        </div>
      </div>

      <div className="note-deleted-wrapper">
        {/* This div will be used to let the user know that the note has been deleted */}
      </div>

      {/* Sidebar */}
      <div className="home-sidebar">
        {/* User Info */}
        <div className="user-info">
          {/* User Icon */}
          <div className="profile-wrapper">
            <img src={userIcon} className="user-icon"/>
          </div>
          <p>{removeQuotationMarks(localStorage.getItem('email')  || " ")}</p>
        </div>

        {/* Create a new note button */}
        <button className="create-note-btn" onClick={() => createNote()}><img src={plusIcon} className='plus-icon'/>Create new note</button>

        {/* Notes */}
        <div className="notes">

            {notes?.map((note, index) =>{
             let date:any 
             if(note.fetchedFromDatabase) date = resolveDate(note.lastUpdatedAt.toDate())
             else date = note.lastUpdatedAt
            
              return (
                <div className="note" key={index}>
                  {/* Note Title and 'more options' button wrapper */}
                  <div style={{height:'20%', borderBottom:'1px solid white', display:'flex', alignItems:'center', position:'relative'}}>
                    <p className="note-title">{note.noteTitle}</p>

                    <div className="more-options" onClick={() => showMoreOptions(index)}>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>

                    <div className="more-options-menu">
                      <button className="delete-note-btn" onClick={() => {preDelete(note.noteId, index, note.noteTitle)}}>Delete</button>
                    </div>
                  </div>
                  {/*  */}

                  {/* This div is used to view the note */}
                  <div className="view-note-div" onClick={() => handleShowNote(note.noteId, index, note.noteTitle, note.noteContent, note.fontSize, note.fontFamily, note.isBold, note.isItalic, note.isUnderline, note.fetchedFromDatabase)}>
                    <span className="last-update">Last updated at:{`${date.day}/${date.month}/${date.year}/${date.hours}:${date.minutes}`}</span>
                  </div>
                  
                </div>
              )
            })}
        </div>

      </div>
          
       {/* Note Editor */}
       {/* noteId is the document ID stored on firestore */}
       {showNote && 
        <NoteEditor notes={notes} setNotes={setNotes} noteId={noteId} noteIndex={noteIndex} setNoteId={setNoteId} noteTitle={noteTitle} setNoteTitle={setNoteTitle} noteContent={noteContent} setNoteContent={setNoteContent} selectedFont={selectedFont} setSelectedFont={setSelectedFont}
       fontSize={fontSize} setFontSize={setFontSize} isBold={isBold} setIsBold={setIsBold} isItalic={isItalic} setIsItalic={setIsItalic} isUnderline={isUnderline} setIsUnderline={setIsUnderline} fontFamilies={fontFamilies} showNote={showNote} setShowNote={setShowNote} fetchedFromDatabase={fetchedFromDatabase} setFetchedFromDatabase={setFetchedFromDatabse}/>
       }
      
    </div>
  )
}
