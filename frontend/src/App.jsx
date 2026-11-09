import { useRef, useState } from 'react'

function App() {
    const fileInputRef = useRef(null)
    const [message, setMessage] = useState('')

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

        //creates the post request to the backend with the uploaded CSV file
        try {
            setMessage('Uploading CSV file...')

            const response = await fetch('http://127.0.0.1:8000/upload-csv/', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.detail || 'Upload failed.')
            }

            setMessage(`Upload successful.`)
            console.log('CSV data returned by backend:', result.data)
        } catch (error) {
            //error handling for uploading process
            setMessage(error instanceof Error ? error.message : 'Upload failed.')

        }
    }

    return (
        <div id="file-upload-container" style = {{
            backgroundColor: 'white',
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: 0
        }}>
            {/* this is the form for submitting the csv file */}
            <form onSubmit={handleSubmit}>
                <input type="file" ref={fileInputRef} accept=".csv" />
                <button id="upload-button" type="submit">Upload CSV</button>
            </form>
            {/* this is the message area for displaying upload status */}
            <p>{message}</p>
        </div>
    );
}

export default App