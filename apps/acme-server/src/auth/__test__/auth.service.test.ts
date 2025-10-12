import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../auth.service'
import { SignupSchemaType } from '../auth.types'

describe('AuthService', () => {
  let service: AuthService

  const mockInsertOne = vi.fn()
  const mockUserModel = {
    insertOne: mockInsertOne,
  }

  beforeEach(() => {
    service = new AuthService(mockUserModel as any)
  })

  /* ---------------------- signup ---------------------- */
  it('should create a new user', async () => {
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
    } as any

    mockInsertOne.mockResolvedValue(fakeUser)

    const result = await service.signup(body)

    expect(mockInsertOne).toHaveBeenCalledWith(body)
    expect(result).toEqual(fakeUser)
  })

  /* ---------------------- signin ---------------------- */
})

