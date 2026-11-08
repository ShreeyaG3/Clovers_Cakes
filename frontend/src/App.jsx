import { useRef, useState } from 'react'

function App() {
    const fileInputRef = useRef(null)

    const handleSubmit = async (event) => {
       // needs to create a post request to the backend with the uploaded CSV file
       event.preventDefault()

       const file = fileInputRef.current.files[0]
       // check if a file was selected
       if (!file) {
            setMessage('Please choose a CSV file first.')
            return
        }

        // creates a FormData object to hold uploaded csv file
        const formData = new FormData()
        formData.append('file', file)

        //createst the post request to the backend with the uploaded CSV file
        try {
            const response = await fetch('http://127.0.0.1:8000/upload-csv/', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.detail || 'Upload failed.')
            }

            setMessage(result.message)
            console.log('CSV data returned by backend:', result.data)
        } catch (error) {
            //error handling for uploading process
            setMessage(error instanceof Error ? error.message : 'Upload failed.')
        }
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