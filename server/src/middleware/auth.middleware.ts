import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

interface TokenPayload{
    id: string
    username: string
    email: string
}

export function authenticate(req: Request, res: Response, next: NextFunction){
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({ error: 'Token mal fornecido' })
    }

    const token = authHeader.split(' ')[1]

    try{
        const payload = jwt.verify(token, JWT_SECRET) as TokenPayload
        req.user = { id: payload.id, username: payload.username, email: payload.email }
        next()
    } catch {
        return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction){
    const authHeader = req.headers.authorization

    if(authHeader?.startsWith('Bearer ')){
        const token = authHeader.split(' ')[1]
        try{
            const payload = jwt.verify(token, JWT_SECRET) as TokenPayload
            req.user = { id: payload.id, username: payload.username, email: payload.email }
        } catch {
            //token invalido
        }
    }

    next()
}

