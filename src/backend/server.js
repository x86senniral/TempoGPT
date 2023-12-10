import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/ask', (req, res) => {
    const userInput = req.body.question;
    const pythonProcess = spawn('python3', ['../utility/chatbot.py']);
    console.log('Request Received');

    pythonProcess.stdin.write(userInput + "\n");
    pythonProcess.stdin.end();

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        if (code !== 0) {
            return res.status(500).json({ error: 'An error occurred' });
        }
        try {
            const response = JSON.parse(output);
            res.json({ response: response.response });
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).json({ error: 'Error parsing JSON from Python script' });
        }
    });
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
