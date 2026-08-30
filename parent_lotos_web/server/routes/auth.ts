import type { Request, Response } from 'express'
import { z } from 'zod'

const API_BASE = 'http://localhost:8000/api'

export async function requestOtp(req: Request, res: Response) {
  try {
    const response = await fetch(`${API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify({ phone: req.body.phone }),
    })
    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Request OTP Proxy Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const response = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify(req.body),
    })
    const data = await response.json()
    
    if (response.ok) {
        res.cookie('token', data.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
    }
    
    return res.status(response.status).json(data)
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const token = req.cookies.token
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json' 
      },
    })
    res.clearCookie('token')
    return res.json({ ok: true })
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function me(req: Request, res: Response) {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({ user: null })
  }
  
  const response = await fetch(`${API_BASE}/me`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json' 
    },
  })
  const data = await response.json()
  return res.status(response.status).json(data)
}
