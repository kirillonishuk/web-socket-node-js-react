import React, { Component } from 'react';
import './style.css';

const ChatHistory = (props) => {
    const handleChooseUser = (name, key) => {
        let data = {
            name: name,
            key: key
        };
        props.onChooseUser(data.name, data.key);
    };

    return props.history.map((elem, id) => {
        if (elem.newUser)
            return (
                <p key={id} className='new-user'>
                    Пользователь <span className='new-user-name' onClick={() => handleChooseUser(elem.userName, elem.userKey)}>{elem.userName}</span> подключился к чату
                </p>
            )
        if (elem.loseUser)
            return (
                <p key={id} className='disc-user'>
                    Пользователь <span className='disc-user-name' onClick={() => handleChooseUser(elem.userName, elem.userKey)}>{elem.userName}</span> отключился
                </p>

            )
        if (elem.private && elem.yourMes)
            return (
                <p key={id} className='init your-private-message'>
                    <span className='whose-send-discr'>Личное сообщение для </span>
                    <span className='whose-send-name' onClick={() => handleChooseUser(elem.getterName, elem.getterKey)}>{elem.getterName}</span><br />
                    <span className='message-text'>{`${elem.message[0].toUpperCase()}${elem.message.substring(1)}`}</span>

                </p>
            )
        if (elem.private)
            return (
                <p key={id} className='init for-you-private-message'>
                    <span className='whose-send-discr'>Личное сообщение от </span>
                    <span className='whose-send-name' onClick={() => handleChooseUser(elem.userName, elem.userKey)}>{elem.userName}</span><br />
                    <span className='message-text'>{`${elem.message[0].toUpperCase()}${elem.message.substring(1)}`}</span>

                </p>
            )
        if (elem.yourMes)
            return (
                <p key={id} className='init your-message'>
                    <span className='you-disc'>Вы отправили</span><br />
                    <span className='you-text'>{`${elem.message[0].toUpperCase()}${elem.message.substring(1)}`}</span>

                </p>
            )
        return (
            <p key={id} className='init other-message'>
                <span className='who-send' onClick={() => handleChooseUser(elem.userName, elem.userKey)}>{elem.userName}</span>
                <span className='who-disc'> Отправил</span><br />
                <span className='what-send'>{`${elem.message[0].toUpperCase()}${elem.message.substring(1)}`}</span>

            </p>
        )
    })
};

class Chat extends Component {
    componentDidUpdate() {
        this.chat.scrollTo(0, this.chat.scrollHeight)
    }
    render() {
        return (
            <div ref={ref => this.chat = ref} className='chat-box'>
                <ChatHistory history={this.props.history} onChooseUser={this.props.onChooseUser} />
                {this.chat ? this.chat.scrollTo(0, this.chat.scrollHeight + 999) : null}
            </div>
        )
    }
}

export default Chat;
