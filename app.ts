import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import cluster from 'cluster';
import os from 'os';

dotenv.config();
const app = express();
const PORT: string | number = process.env.PORT || 4000; // Update the default port

interface User {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
}
let users: User[] = [];

app.use(express.json());

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Get all users
app.get('/api/users', (req: Request, res: Response) => {
    res.json(users);
});

// Get a specific user
app.get('/api/users/:userId', (req: Request, res: Response) => {
    const userId: string = req.params.userId;
    const user: User | undefined = users.find(u => u.id === userId);
    if (!user) {
        res.status(404).json({ error: 'User not found' });
    } else {
        res.json(user);
    }
});

// Create a new user
app.post('/api/users', (req: Request, res: Response) => {
    const { username, age, hobbies }: User = req.body;
    if (!username || !age) {
        res.status(400).json({ error: 'Username and age are required fields' });
    } else {
        const newUser: User = {
            id: uuidv4(),
            username,
            age,
            hobbies: hobbies || [],
        };
        users.push(newUser);
        res.status(201).json(newUser);
    }
});

// Update an existing user
app.put('/api/users/:userId', (req: Request, res: Response) => {
    const userId: string = req.params.userId;
    const updatedUser: User = req.body;
    const index: number = users.findIndex(u => u.id === userId);
    if (index === -1) {
        res.status(404).json({ error: 'User not found' });
    } else {
        users[index] = { ...users[index], ...updatedUser };
        res.json(users[index]);
    }
});

// Delete a user
app.delete('/api/users/:userId', (req: Request, res: Response) => {
    const userId: string = req.params.userId;
    users = users.filter(u => u.id !== userId);
    res.sendStatus(204);
});

// Define the logic for clustering and load balancing
if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    const numCPUs = os.cpus().length - 1; // Number of available parallelism - 1

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    const workerId = cluster.worker?.id || 0; // Handle the case where cluster.worker might be undefined
    const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT; // Convert PORT to a number if it's a string
    app.listen(portNumber + workerId, () => {
        console.log(`Worker ${workerId} is running on port ${portNumber + workerId}`);
    });
}