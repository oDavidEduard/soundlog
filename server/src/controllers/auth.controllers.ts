import { Request, Response } from 'express'
import { z } from 'zod'
import * as authService from '../services/auth.services'

const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'Username deve ter pelo menos 3 caracteres')
        .max(30, 'Username deve ter no máximo 30 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username só pode conter letras, números e _'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    displayName: z.string().max(50).optional(),
})

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

const ERROR_MAP: Record<string, { status: number; message: string }> = {
  EMAIL_IN_USE:        { status: 409, message: 'Este email já está em uso' },
  USERNAME_IN_USE:     { status: 409, message: 'Este username já está em uso' },
  INVALID_CREDENTIALS: { status: 401, message: 'Email ou senha incorretos' },
  USER_NOT_FOUND:      { status: 404, message: 'Usuário não encontrado' },
}

//export async function register(req: Request, res: Response).....

