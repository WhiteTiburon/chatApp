import React, { useContext, useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import Logo from './Logo'
import { UserContext } from './UserContext'
import { useForm } from 'react-hook-form'
import { uniqBy } from 'lodash'
import axios from 'axios'

const Chat = () => {
    const [ newMessageText, setNewMessageText ] = useState('')
    const [ ws, setWs ] = useState({})
    const [ onlinePeople, setOnlinePeople ] = useState({})
    const [ selecteduserId, setSelectedUserId ] = useState(null)
    const { username, id, setUsername, setId } = useContext(UserContext)
    const [ messages, setMessages ] = useState([])
    const [ offlinePeople, setOfflinePeople ] = useState({})
    const divUnderMessages = useRef()

    useEffect(() => {
        // online vs local
        const ws = new WebSocket('wss://chat.jonatech.cloud')
        // const ws = new WebSocket('ws://localhost:8080')
        setWs(ws)
        ws.addEventListener('message', handleMessage)
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Disconnected, reconnecting...')
                connectToWs()
            }, 1000)
        })
        return () => {ws?.removeEventListener('message', handleMessage)}
    }, [selecteduserId])

    // function connectToWs(){
    //     // local vs online
    //     // const ws = new WebSocket('wss://chat.jonatech.cloud')
    //     // const ws = new WebSocket('ws://localhost:8080')
    //     // setWs(ws)
    //     // ws.addEventListener('message', handleMessage)
    //     // ws.addEventListener('close', () => {
    //     //     setTimeout(() => {
    //     //         console.log('Disconnected, reconnecting...')
    //     //         connectToWs()
    //     //     }, 1000)
    //     // })
    // }

    const showOnlinePeople = (peopleArr) => {
        const people = {}
        peopleArr.forEach(({userId, username}) => {
            people[userId] = username
        })
        setOnlinePeople(people)
    }

    const handleMessage = (e) => {
       const messageData = JSON.parse(e.data)
        if ('online' in messageData){
            showOnlinePeople(messageData.online)
        }else if ('text' in messageData){
            if (messageData.sender === selecteduserId){
                setMessages(prev => ([...prev, {...messageData}]))
            }
        }
    }

    const onlinePeopleButUser = {...onlinePeople}
    delete onlinePeople[id]

    const sendMessage = async (e, file = null) => {
        if (e) e.preventDefault()
        ws.send(JSON.stringify({
            recepient: selecteduserId,
            text: newMessageText,
            file,
        }))
        if(file){
            axios.get('/api/messages/' + selecteduserId).then(response => {
                setMessages(response.data)
            })
        }else{
            setMessages(prev => ([...prev,{
                text: newMessageText,
                sender: id,
                recepient: selecteduserId,
                _id: Date.now()
            }]))
            setNewMessageText('')
        }
    }

    const filteredMessages = uniqBy(messages, '_id')

    function logout(){
        axios.post('/api/logout').then(() => {
            setWs(null)
            setId(null)
            setUsername(null)
        })
    }

    function sendFile (e){
        const reader = new FileReader()
        reader.readAsDataURL(e.target.files[0])
        reader.onload = () => {
            sendMessage(null, {
                name: e.target.files[0].name,
                info: reader.result,
            })
        }
    }

    useEffect(() => {
        const div = divUnderMessages.current
        if(div){
            div.scrollIntoView({behavior:'smooth', block:'end'})
        }
    }, [filteredMessages])

    useEffect(() => {
        axios.get('/api/users').then(response => {
            const offlinePeopleArr = response.data.filter(p => p._id !== id).filter(p => !Object.keys(onlinePeople).includes(p._id))
            const offlinePeople = {}
            offlinePeopleArr.forEach(p => {
                offlinePeople[p._id] = p
            })
            setOfflinePeople(offlinePeople)
        })
    }, [onlinePeople])

    useEffect(() => {
        if (selecteduserId){
            axios.get('/api/messages/' + selecteduserId).then(response => {
                setMessages(response.data)
            })
        }
    }, [selecteduserId])

  return (
    <div className='flex h-screen'>
        <div className='bg-white w-1/3 flex flex-col'>
            <div className='flex-grow'>
                <Logo />
                {Object.keys(onlinePeopleButUser).map(userId => (
                    <div key={userId} onClick={() => setSelectedUserId(userId)}
                    className={'border-b border-gray-100 flex gap-2 items-center cursor-pointer ' + (userId === selecteduserId ? 'bg-blue-50': '')}>
                        {userId === selecteduserId && (
                            <div className='w-1 bg-blue-500 h-12 rounded-r-md'>

                            </div>
                        )}
                        <div className='flex gap-2 py-2 pl-4 itmes-center'>
                            <Avatar online={true} username={onlinePeople[userId]} userId={userId}/>
                            <span className='text-gray-800'>
                                {onlinePeople[userId]}
                            </span>
                        </div>
                    </div>
                ))}
                {Object.keys(offlinePeople).map(userId => (
                    <div key={userId} onClick={() => setSelectedUserId(userId)}
                    className={'border-b border-gray-100 flex gap-2 items-center cursor-pointer ' + (userId === selecteduserId ? 'bg-blue-50': '')}>
                        {userId === selecteduserId && (
                            <div className='w-1 bg-blue-500 h-12 rounded-r-md'>

                            </div>
                        )}
                        <div className='flex gap-2 py-2 pl-4 itmes-center'>
                            <Avatar online={false} username={offlinePeople[userId]} userId={userId}/>
                            <span className='text-gray-800'>
                                {offlinePeople[userId].username}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <div className='p-2 text-center flex items-center justify-center'>
                <span className='mr-2 text-sm text-gray-600 flex items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {username}
                </span>
                <button
                    onClick={logout}
                    className='text-sm text-gray-500 bg-blue-100 py-y px-2 border rounded-md'>logout</button>
            </div>
        </div>
        <div className='flex flex-col bg-blue-100 w-2/3 p-2'>
            <div className='flex-grow'>
                {!selecteduserId &&(
                    <div className='flex h-full flex-grow items-center justify-center'>
                        <div className='text-gray-400'>
                            &larr; Select a conversation
                        </div>
                    </div>
                )}
                {!!selecteduserId &&(
                    <div className='relative h-full'>
                        <div className='absolute inset-0 overflow-y-scroll top-0 left-0 right-0 bottom-2'>
                        {filteredMessages.map((message,key) => (
                            <div key={key} className={(message.sender === id ? 'text-right' : 'text-left')}>
                                <div className={"text-left inline-block p-2 my-2 rounded-lg text-sm " + (message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500')} key={message.text}>
                                {message.text}
                                {message.file && (
                                    <div>
                                        <a className='underline'  href={axios.defaults.baseURL + '/uploads/' + message.file}>
                                            {message.file}
                                        </a>
                                    </div>
                                )}
                                </div>
                            </div>
                        ))}
                        <div ref={divUnderMessages} />
                        </div>
                    </div>
                )}
            </div>
            {!!selecteduserId && (
            <form className='flex gap-2' onSubmit={sendMessage}>
                <input  type="text"
                        value={newMessageText}
                        placeholder={'Type your message here'}
                        className="bg-white border p-2 flex-grow rounded-md"
                        onChange={e => setNewMessageText(e.target.value)}
                />
                <label className='bg-blue-200 p-2 text-gray-600 rounded-md border cursor-pointer'>
                    <input
                        type={'file'}
                        className='hidden'
                        onChange={sendFile}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                </label>
                <button type='submit' className='bg-blue-500 p-2 text-white rounded-md border'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
            </form>
            )}
        </div>
    </div>
    )
}

export default Chat