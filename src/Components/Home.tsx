import {useEffect, useState} from 'react'
import userIcon from '../images/user.svg'
import plusIcon from '../images/plus.svg'
import removeQuotationMarks from '../functions/removeQuotationMarks'
import NoteEditor from './NoteEditor'
import "../Styles/Home.css"
import { auth, db } from '../firebase-config'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
// import { useNavigate } from 'react-router-dom'

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
    // const navigate = useNavigate()
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
          }
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
          createdAt: new Date(),
          lastUpdatedAt:new Date(),
          fontFamily: fontFamilies.come
        })
        setNotes(tempArr)
        
      }
    }
  
    function resolveDate(date:Date){
      const year = date.getFullYear()
      let month;
      const day = date.getDate()
      const hours = date.getHours()
      const minutes = date.getMinutes()

      switch(date.getMonth()){
          case 0:
              month = 'January'
              break;
          case 1:
              month = "February"
              break;
          case 2:
              month = "March"
              break;
          case 3:
              month = "April"
              break;
          case 4:
              month = "May"
              break;
          case 5:
              month = "June"
              break;
          case 6:
              month = "July"
              break;
          case 7:
              month = "August"
              break;
          case 8:
              month = "September"
              break;
          case 9:
              month = "October"
              break;
          case 10:
              month = "Noveber"
              break;
          case 11:
              month = "December"
              break;
          default:
              month = "Error"
              break;
      }
      return {day, month, year, hours, minutes}
  }
  return (
    <div className="home-wrapper">

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
              let date = resolveDate(note.lastUpdatedAt.toDate())
              
              return (
                <div className="note" key={index} onClick={() => handleShowNote(note.noteId, index, note.noteTitle, note.noteContent, note.fontSize, note.fontFamily, note.isBold, note.isItalic, note.isUnderline, note.fetchedFromDatabase)}>
                  <p className="note-title">{note.noteTitle}</p>
                  <span className="last-update">Last updated at:{`${date.day}/${date.month}/${date.year}/${date.hours}:${date.minutes}`}</span>
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
