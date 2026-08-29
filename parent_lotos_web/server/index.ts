import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { logout, me, requestOtp, verifyOtp } from './routes/auth.js'

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.post('/api/auth/request-otp', requestOtp)
app.post('/api/auth/verify-otp', verifyOtp)
app.post('/api/auth/logout', logout)
app.get('/api/me', me)

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
