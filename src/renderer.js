import './index.css';

const textArea = document.getElementById('textarea')

window.electronAPI.handleContent((event, data) => {
    textArea.innerText = data
    event.sender.send('content-data', data)
})