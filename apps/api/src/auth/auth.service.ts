import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { UsersService } from '../users/users.service'
import { User } from '../users/entities/user.entity'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password } = registerDto

    // Check if email already exists
    const existingUserByEmail = await this.usersService.findByEmail(email)
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists')
    }

    // Check if username already exists
    const existingUserByUsername = await this.usersService.findByUsername(username)
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await this.usersService.create({
      email,
      username,
      password: hashedPassword,
    })

    // Generate JWT token
    const accessToken = this.generateToken(user)

    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      data: {
        accessToken,
        user: userWithoutPassword,
      },
    }
  }

  async login(loginDto: LoginDto) {
    const { emailOrUsername, password } = loginDto

    // Find user by email or username
    const user = await this.usersService.findByEmailOrUsername(emailOrUsername)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Generate JWT token
    const accessToken = this.generateToken(user)

    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      data: {
        accessToken,
        user: userWithoutPassword,
      },
    }
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email, username: user.username }
    return this.jwtService.sign(payload)
  }

  async validateUser(userId: string): Promise<User> {
    return this.usersService.findById(userId)
  }
}
