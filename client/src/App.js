import React, { Component } from 'react';
import './App.css';
import Chat from './components/Chat';
import Users from './components/Users';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isConnected: false,
            myKey: null,
            users: [],
            name: '',
            message: '',
            toUser: '',
            toUserKey: '',
            chatHistory: [],
            formIsOpen: true,
            img: []
        }


    }

    componentDidMount() {
        this.enterName.focus();
    }

    handleSocketMessage(event) {
        let message = JSON.parse(event.data)
        if (message.type === 'users online') {
            //console.log('users online');
            this.setState({
                users: message.users,
                myKey: message.myKey
            })
            //console.log(this.state.users)
        }

        if (message.type === 'new user') {
            //console.log('new user')
            this.setState(prev => {
                return {
                    users: prev.users.concat({
                        name: message.user,
                        key: message.key
                    }),
                    chatHistory: prev.chatHistory.concat({
                        newUser: true,
                        userName: message.user,
                        userKey: message.key
                    })
                }
            })
            //console.log(this.state.users)
        }

        if (message.type === 'user disconnect') {
            //console.log('user disconnect')
            this.setState(prev => {
                return {
                    users: prev.users.filter(elem => elem.key !== message.key),
                    chatHistory: prev.chatHistory.map(elem => (elem.newUser && elem.userKey === message.key) ? { ...elem, userKey: this.state.myKey } : elem).concat({
                        loseUser: true,
                        userName: message.name,
                        userKey: message.key
                    })
                }
            })
            if (this.state.toUserKey === message.key)
                this.setState({
                    toUser: '',
                    toUserKey: ''
                })
            //console.log(this.state.users)
        }

        if (message.type === 'new all message') {
            //console.log('new all message');
            this.setState(prev => {
                return {
                    chatHistory: prev.chatHistory.concat({
                        private: false,
                        yourMes: message.fromUserKey === this.state.myKey,
                        senderName: null,
                        userName: message.fromUser,
                        userKey: message.fromUserKey,
                        message: message.message,
                        img: message.img,
                    })
                }
            })
            //console.log(this.state.chatHistory)
        }

        if (message.type === 'private message to you') {
            //console.log('private message');
            //console.log(message.fromUserKey, this.state.myKey)
            this.setState(prev => {
                return {
                    chatHistory: prev.chatHistory.concat({
                        private: true,
                        getterName: message.toUser,
                        getterKey: message.toUserKey,
                        yourMes: message.fromUserKey === this.state.myKey,
                        userName: message.fromUser,
                        userKey: message.fromUserKey,
                        message: message.message,
                        img: message.img,
                    })
                }
            })
            //console.log(this.state.chatHistory)
        }
        if (message.type === 'private message from you') {
            //console.log('private message');
            //console.log(message.fromUserKey, this.state.myKey)
            this.setState(prev => {
                return {
                    chatHistory: prev.chatHistory.concat({
                        private: true,
                        getterName: message.toUser,
                        getterKey: message.toUserKey,
                        yourMes: message.fromUserKey === this.state.myKey,
                        userName: message.fromUser,
                        userKey: message.fromUserKey,
                        message: message.message,
                        img: message.img,
                    })
                }
            })
            //console.log(this.state.chatHistory)
        }

    }

    handleNameChange = (e) => {
        this.setState({
            name: e.target.value,
        })
    }

    handleKeyPressName = (e) => {
        if (e.key === 'Enter' && this.state.name) {
            this.sendName.click();
            this.enterMessage.disabled = false;
            this.enterMessage.focus()
        }
    }

    handleMessageChange = (e) => {
        this.setState({
            message: e.target.value,
        })
    }

    handleKeyPressMessage = (e) => {
        if (e.key === 'Enter' && this.state.message) {
            this.sendMessage.click();
            this.setState({
                message: ''
            })
            this.enterMessage.focus()
        }
    }

    handleChooseUser = (elem) => {
        if (elem.key !== this.state.myKey)
            this.setState({
                toUser: elem.name,
                toUserKey: elem.key
            })
    }

    handleSendMessage = () => {
        let message = this.state.message;
        let img = this.state.img
        this.setState({
            message: '',
            img: null,
        })
        if (!this.state.toUser.length) {
            this.ws.send(JSON.stringify({
                type: 'message to all',
                fromUser: this.state.name,
                fromUserKey: this.state.myKey,
                message: message,
                img: img
            }))
        }
        else this.ws.send(JSON.stringify({
            type: 'message to user',
            fromUser: this.state.name,
            fromUserKey: this.state.myKey,
            message: message,
            toUser: this.state.toUser,
            toUserKey: this.state.toUserKey,
            img: img
        }))
    }

    handleConnect = () => {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.setState({
                isConnected: false
            })
        }
        this.ws = new WebSocket(`${process.env.NODE_ENV === 'development' ? 'ws://localhost:80' : 'ws://chat-wsoc.herokuapp.com'}`);
        this.setState({
            isConnected: true,
            formIsOpen: false
        })

        this.ws.onopen = () => {
            console.log('start')
            this.ws.send(JSON.stringify({
                type: 'connection message',
                name: this.state.name
            }))
        };

        this.ws.onclose = function (event) {
            if (event.wasClean)
                console.log('close')
            else console.log('kill')
        };

        this.ws.onmessage = (event) => {
            this.handleSocketMessage(event);
        }
    }

    handleDisconnect = () => {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.setState({
                isConnected: false
            })
        }
        else alert('Connect pls!')
    }


    handleChooseUserData = (name, key) => {
        if (key !== this.state.myKey && this.state.users.find(elem => elem.key === key)) {
            this.setState({
                toUser: name,
                toUserKey: key
            })
            this.enterMessage.focus()
        } else {
            this.setState({
                toUser: '',
                toUserKey: ''
            })
            this.enterMessage.focus()
        }
    }

    handleChooseFile = (e) => {
        if (e.target.files && e.target.files[0]) {
            let reader = new FileReader();
            reader.onload = (e) => {
                let arrImg = e.target.result.split('+');
                this.setState({img: e.target.result});
                console.log(arrImg)
                console.log(this.state.img)
            };
            reader.readAsDataURL(e.target.files[0]);
        }
        // if (e.target.files.length) {
        //     console.log(e.target.files)
        //     const file = e.target.files[0];
        //     const reader = new FileReader();
        //     reader.onloadend = () => {
        //         this.setState({
        //             img: reader.result
        //         })
        //     }
        //     reader.readAsDataURL(file);
        // }
    }


    render() {
        return (
            <div className="App">
                <div className='your-name'>
                    {this.state.name && !this.enterMessage.disabled ? `Ваш ник: ${this.state.name}` : null}
                </div>
                <div className="App-intro">
                    {
                        this.state.isConnected ?
                            <Users users={this.state.users} onChooseUser={this.handleChooseUser} />
                            :
                            <p className='connect-mes'>Подключитесь к чату</p>
                    }
                </div>
                <button className='connect-btn' onClick={() => this.setState(prev => { return { formIsOpen: !prev.formIsOpen } })}>{!this.state.isConnected ? `Подключиться` : `Отключиться`}</button>

                <div className={`container ${this.state.formIsOpen ? 'connection-form-open' : 'connection-form-close'}`}>
                    <label htmlFor='username'>Введите своё Имя:</label>
                    <input
                        ref={ref => this.enterName = ref}
                        id='username'
                        value={this.state.name}
                        onChange={this.handleNameChange}
                        disabled={this.state.isConnected}
                        onKeyPress={this.handleKeyPressName}
                    />
                    <button
                        ref={ref => this.sendName = ref}
                        className='connect'
                        onClick={this.handleConnect}
                        disabled={!this.state.name.length}
                    >Подключиться</button>
                    <button className='disconnect' onClick={this.handleDisconnect}>Отключиться</button>
                </div>


                <Chat history={this.state.chatHistory} onChooseUser={this.handleChooseUserData} />
                <div className='new-message'>
                    {this.state.toUser.length ?
                        <span className='send-to-disc'>Отправить сообщение <span
                            className='send-to'
                            onClick={() => this.setState({ toUser: '', toUserKey: '' })}
                        >{this.state.toUser}</span></span>
                        :
                        null
                    }
                    <input
                        ref={ref => this.enterMessage = ref}
                        className='message'
                        placeholder='Введите соббщение'
                        value={this.state.message}
                        onChange={this.handleMessageChange}
                        disabled={!this.state.isConnected}
                        onKeyPress={this.handleKeyPressMessage}
                    />
                    <button
                        ref={ref => this.sendMessage = ref}
                        disabled={!this.state.isConnected || !this.state.message}
                        onClick={this.handleSendMessage}
                    >Отправить</button>
                </div>
            </div>
        );
    }
}

export default App;
