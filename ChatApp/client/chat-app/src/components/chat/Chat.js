import React, {useEffect, useState} from 'react';
import queryString from 'query-string';
import { io } from 'socket.io-client';

import TextContainer from '../text_container/TextContainer';
import Messages from '../messages/Messages';
import InfoBar from '../infobar/InfoBar';
import Input from '../input/Input';

import './ChatStyles.css';

const END_POINT = "http://localhost:5050";
let socket;

export default function Chat({location}) {
    
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [users, setUsers] = useState('');

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // establish the socket connection
        socket = io(END_POINT);

        const { name, room } = queryString.parse(location.search);

        socket.emit("join", { name, room }, ({ error })=>{
            console.log(error);
        });

        setName(name);
        setRoom(room);

        return () => {
            socket.emit('disconnect', {name: name, room: room});
            
            socket.off();
        }
    }, []);

    useEffect(() => {
        socket.on('message', message => {
            setMessages([...messages, message]);
        });

        socket.on("roomData", ({ users }) => {
            setUsers(users);
        });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();

        socket.emit('sendMessage', message, () => {
            setMessage('');
        })
    }

    return (
        <div className="outerContainer">
            <div className="container">
                <div className="outerContainer">
                    <div className="container">
                        <InfoBar room={room} />
                        <Messages messages={messages} name={name} />
                        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
                    </div>
                    <TextContainer users={users} />
                </div>
            </div>
        </div>
    )
}
