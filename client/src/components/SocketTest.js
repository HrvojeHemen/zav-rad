import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';


function SocketTest() {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(`http://${window.location.hostname}:3000`);
        setSocket(newSocket);
        return () => newSocket.close();
    }, [setSocket]);

    let saljidata = function(){

        console.log("Saljem")
        socket.emit("bla", 123)
    }

    return (
        <div className="App">
            <header className="app-header">
                React Chat
            </header>
            {socket ? (
                    <div className="chat-container">
                    </div>
                ) :
                (
                    <div>Not Connected</div>
                )}

            <button onClick={saljidata}>Klikni me</button>
        </div>
    );
}

export default SocketTest;