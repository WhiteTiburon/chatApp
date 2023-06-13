import express, { response } from 'express'
import 'dotenv/config'
import mongoose from 'mongoose'
import { UserModel } from './models/User.js'
import { MessageModel } from './models/Message.js'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'
import { WebSocketServer } from 'ws'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

try{
    mongoose.connect(process.env.MONGO_URL)
    console.log('Connected to DB')
}catch(e){
    console.log('Error connecting to db')
}
const jwtSecret = process.env.JWT_SECRET
const bcryptSalt = bcrypt.genSaltSync(10)
const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, '/dist')))
app.use(cookieParser())
app.use('/uploads', express.static(__dirname + '/uploads'))

const PORT = process.env.PORT || 8080

app.use(cors({
    credentials: true,
    origin: 'https://chat.jonatech.cloud'
    // origin: 'http://localhost:5173'
}))

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body
    try{
        const hashedPwd = bcrypt.hashSync(password, bcryptSalt)
        const createdUser = await UserModel.create({
             username,
             password: hashedPwd,
        })
        jwt.sign({ userId: createdUser._id, username}, jwtSecret, (err, token) => {
            if (err) throw err
            return res.cookie('token', token).json({
                id: createdUser._id,
                username,
            })
        })
    }catch(e){
        if (e) throw e
        res.status
    }
})

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body
    const user = await UserModel.findOne({username})
    if (user){
        const passOk = bcrypt.compareSync(password, user.password)
        if (passOk){
            jwt.sign({ userId: user._id, username}, jwtSecret, {}, (err, token) => {
                if (err) throw err
                return res.cookie('token', token).json({
                    id: user._id,
                    username,
                })
            })
        }
    }
})

app.post('/api/logout', (req, res) => {
    res.cookie('token', '').json('okay')
})

app.get('/api/profile', (req, res) => {
    const token = req.cookies?.token
    if (token){
        jwt.verify( token, jwtSecret, {}, (err, userData) => {
            if (err) throw err
            return res.json(userData)
        })
    }else{
        return res.status(401).json('No token found')
    }
})

app.get('/api/messages/:id', (req, res) => {
    const { id } = req.params
    const token = req.cookies?.token
    if (token){
        jwt.verify( token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err
            const ourUserId = userData.userId
            const messages = await MessageModel.find({
                sender: {$in:[id, ourUserId]},
                recepient: {$in:[id, ourUserId]},
            }).sort({createdAt: 1})
            res.json(messages)
        })
    }else{
        return res.status(401).json('No token found')
    }
})

app.get('/api/users', async (req, res) => {
    const users = await UserModel.find({}, {'_id':1, username:1})
    res.json(users)
})

const server = app.listen(PORT, () => console.log('Listening on port ' + PORT))

const wss = new WebSocketServer({server})

wss.on('connection', (connection, req) => {

    function notififyOfOnlinePeople(){
        [...wss.clients].forEach(client => {
            client.send(JSON.stringify({
                online:  [...wss.clients].map(c => ({userId: c.userId, username:c.username}))
            }))
        })
    }
    connection.isAlive = true;

    connection.timer = setInterval(() => {
        connection.ping()
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false
            clearInterval(connection.timer)
            connection.terminate();
            notififyOfOnlinePeople()
            console.log('Killed connection')
        }, 1000)
    }, 5000);

    connection.on('pong', () => {
        clearTimeout(connection.deathTimer)
    });

    //read username and id from the cookie for this connection
    const cookies = req.headers.cookie
    if (cookies){
        const tokenCookie = cookies.split(';').find(str => str.startsWith('token='))
        if (tokenCookie){
            const token = tokenCookie.split('=')[1]
            if (token){
                jwt.verify( token, jwtSecret, {}, (err, userData) => {
                    if (err) throw err
                    const { userId, username } = userData
                    connection.userId = userId
                    connection.username = username
                })
            }
        }
    }

    //send message to another person
    connection.on('message', async (message) => {
        const messageData = JSON.parse(message.toString())
        console.log(messageData)
        const { recepient, text, file } = messageData
        let filename =  null
        if (file){
            const parts = file.name.split('.')
            const ext = parts[parts.length - 1]
            filename = Date.now() + '.' + ext
            const path = __dirname + '/uploads/' + filename
            const bufferData = Buffer.from(file.info.split(',')[1], 'base64')
            fs.writeFile(path, bufferData,() => {
                console.log('image saved')
            })
        }
        if(recepient && (text || file)){
            console.log('creating message')
            const messageDoc = await MessageModel.create({
                sender: connection.userId,
                recepient,
                text,
                file: file ? filename : null
            });
            // console.log(wss.clients);
            [...wss.clients].filter(c => c.userId === recepient)
            .forEach(c => { //console.log(c);
                c.send(JSON.stringify({
                text,
                sender: connection.userId,
                recepient,
                file: file ? filename: null,
                _id: messageDoc._id,
            }))
        })
        }

    });

    //notify every of online people
    notififyOfOnlinePeople()
})
