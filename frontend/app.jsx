import { useState } from 'react'

function App() {

    return (
        <div style = {{
            backgroundColor: 'white',
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: 0
        }}>
            <form>
                <input type="file" ref={fileInputRef} accept=".csv" />
                <button type="submit">Upload CSV</button>
            </form>
        </div>
    );
}

export default App