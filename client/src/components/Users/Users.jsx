import React from 'react';
import './style.css';

const Users = (props) => {
        if (props.users.length)
            return (<div className='online'>
                {props.users.map((elem) =>
                    (<p
                        className='user'
                        onClick={() => props.onChooseUser(elem)}
                        key={elem.key}
                    >
                        {elem.name}
                    </p>))}
            </div>)
        else return <h4 className='offline'>All users offline</h4>
};

export default Users;