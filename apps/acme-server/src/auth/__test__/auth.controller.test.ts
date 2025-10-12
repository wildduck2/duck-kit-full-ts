import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthController } from '../auth.controller'
import { AuthService } from '../auth.service'
import { SignupSchemaType } from '../auth.types'

describe('AuthController', () => {
  let authController: AuthController
  let authService: AuthService

  const mockSignup = vi.fn()

  beforeEach(() => {
    authService = { signup: mockSignup } as any
    authController = new AuthController(authService)
  })

  /* ---------------------- signup ---------------------- */
  it('should call AuthService.signup and return response user data', async () => {
    const body: SignupSchemaType = {
      username: 'duckui',
      password: 'duckpass123',
      email: 'duck@ui.com',
      name: 'Duck UI',
    }

    const fakeUser = {
      _id: '123',
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockSignup.mockResolvedValue(fakeUser)

    const result = await authController.signup(body, {})

    expect(mockSignup).toHaveBeenCalledWith(body)
    expect(result).toEqual({
      state: 'success',
      data: fakeUser,
    })
  })
})

