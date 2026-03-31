import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'
const JWT_EXPIRES_IN = '7d'

export interface RegisterInput{
    username: string
    email: string
    password: string
    displayName?: string
}

export interface LoginInput{
    email: string
    password: string
}

function generateToken(payload: { id: string; username: string; email: string }) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

function sanitizeUser( user: { id: string; username: string; email: string; displayName: string | null; avatarUrl: string | null; bio: string | null; createdAt: Date}){
    return{
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        createdAt: user.createdAt
    }
}

export async function register(input: RegisterInput){
    const { username, email, password, displayName } = input

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if(existingEmail) throw new Error('EMAIL_IN_USE')

    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if(existingUsername) throw new Error('USERNAME_IN_USE')

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
        data:{
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            passwordHash,
            displayName: displayName || username,
        },
    })

    const token = generateToken({ id: user.id, username: user.username, email: user.email })

    return { user: sanitizeUser(user), token }
}

export async function login(input: LoginInput){
    const { email, password } = input

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if(!user) throw new Error('INVALID_CREDENTIALS')

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if(!passwordMatch) throw new Error('INVALID_CREDENTIALS')

    const token = generateToken({ id: user.id, username: user.username, email: user.email })

    return { user: sanitizeUser(user), token }
}

export async function getMe(userId: string){
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
            _count:{
                select:{
                    reviews: true,
                    lists: true,
                    followers: true,
                    following: true,
                }
            }
        }
    })

    if(!user) throw new Error('USER_NOT_FOUND')
    return user
}

