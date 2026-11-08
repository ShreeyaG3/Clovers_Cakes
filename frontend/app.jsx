import { useState } from 'react'
import { useRef } from 'react'


function App() {
    const fileInputRef = useRef(null)

    const handleSubmit = (event) => {
       // needs to create a post request to the backend with the uploaded CSV file
    }

    return (
        <div style = {{
            backgroundColor: 'white',
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: 0
        }}>
            <form onSubmit={handleSubmit}>
                <input type="file" ref={fileInputRef} accept=".csv" />
                <button id="upload-button" type="submit">Upload CSV</button>
            </form>
        </div>
    );
}

export default App