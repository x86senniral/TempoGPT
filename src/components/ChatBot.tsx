import React, { useState, useEffect } from 'react'
import './components.css'
import db from '../authentication/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, getFirestore, getDocs, deleteDoc, doc } from 'firebase/firestore';


//User Message Interface
interface IMessage {
    id: string;
    text: string | { response: string };
    timestamp: any;
    type: 'user';
}


//GPT's interface
interface GPTMessage{
    id: string;
    text: string | {response : string};
    timestamp: any;
    type: 'Tempo';
}


const ChatBot = () => { 

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [GPTMessages, setGPTMessages] = useState<GPTMessage[]>([]);
    const [allMessages, setAllMessages] = useState<(IMessage | GPTMessage)[]>([]);

    useEffect(() => {
        const userMessagesQuery = query(collection(db, "messages"), orderBy("timestamp", "asc"));
        const gptMessagesQuery = query(collection(db, 'gpt_message'), orderBy("timestamp", "asc"));

        
        const unsubscribeUserMessages = onSnapshot(userMessagesQuery, (querySnapshot) => {
            const messagesArray: IMessage[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                text: doc.data().text,
                timestamp: doc.data().timestamp,
                type: 'user' 
            }));
            
            setMessages(messagesArray);
        });

        const unsubscribeGPTMessages = onSnapshot(gptMessagesQuery, (querySnapshot) => {
            const gptMessagesArray: GPTMessage[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                text: doc.data().text,
                timestamp: doc.data().timestamp,
                type: 'Tempo' 
            }));            
            setGPTMessages(gptMessagesArray);
        });

        return () => {
            unsubscribeUserMessages();
            unsubscribeGPTMessages();
        };
    }, []);
    //combining all messages
    useEffect(() => {
        const combinedMessages = [...messages, ...GPTMessages];
        combinedMessages.sort((a, b) => a.timestamp - b.timestamp);
        setAllMessages(combinedMessages);
    }, [messages, GPTMessages]);
    
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submit clicked, message:", message);
    
        if (message !== "") {
            try {
                // Send user message to Firebase
                await addDoc(collection(db, "messages"), {
                    text: message,
                    timestamp: new Date(),
                });
    
                // Send message to Express server and get GPT-3 response
                const response = await fetch('http://localhost:3000/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question: message }),
                });
    
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const data = await response.json();
                console.log("GPT-3 Response:", data.response);
    
                // Send GPT response to Firebase
                await addDoc(collection(db, "gpt_message"), {
                    text: data.response, 
                    timestamp: new Date(),
                });
    
                // Clear the input field after submitting
                setMessage(""); 
            } catch (error) {
                console.error("Error:", error);
            }
        }
    };

    const deleteCollections = async (collectionNames: string[]) => {
        for (const collectionName of collectionNames) {
          const q = query(collection(db, collectionName));
          const querySnapshot = await getDocs(q);
          for (const document of querySnapshot.docs) {
            await deleteDoc(doc(db, collectionName, document.id));
          }
        }
      };
      
    const handleDeleteCollection = async() => {
        deleteCollections(["messages", "gpt_message"]);
    }
    
    
  return (
    <>
    <main>
        <div className='chat-space'>
            <h1 className='text-center text-3xl text-white'>Talk with Tempo....</h1>
            <form onSubmit={handleSubmit} className='mt-9 wrapper'>
                <div className="messages-container">
                <ul>
                {allMessages.map((msg) => (
    <li key={msg.id} className={msg.type === 'user' ? "user-message" : "gpt-message"}>
        {msg.type === 'user' ? "You: " : "Tempo: "}
        {msg.text ? (typeof msg.text === 'string' ? msg.text : msg.text.response) : 'Message not received.'}
    </li>
))}

</ul>

                </div>
                <div className="input-container">
                    <input
                        type="text"
                        placeholder="Your message..."
                        className="inp"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button type="submit" className="button-arounder ">Send</button>
                    <button type="submit" className="button-arounder bg-red-600" onClick={handleDeleteCollection}>Delete</button>
                </div>
            </form>         
        </div>
    </main>
</>
  )
}

export default ChatBot

