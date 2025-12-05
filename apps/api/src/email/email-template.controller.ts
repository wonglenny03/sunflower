import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { EmailTemplateService } from './email-template.service'
import { EmailTemplateInitService } from './email-template-init.service'
import { CreateEmailTemplateDto } from './dto/create-email-template.dto'
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../users/entities/user.entity'

@ApiTags('email-templates')
@Controller('email-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailTemplateController {
  constructor(
    private readonly emailTemplateService: EmailTemplateService,
    private readonly emailTemplateInitService: EmailTemplateInitService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new email template' })
  async create(@Body() createDto: CreateEmailTemplateDto, @CurrentUser() user: User) {
    return this.emailTemplateService.create(createDto, user.id)
  }

  @Get()
  @ApiOperation({ summary: 'Get all email templates for current user' })
  async findAll(@CurrentUser() user: User) {
    const templates = await this.emailTemplateService.findAll(user.id)
    return templates
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default email template' })
  async findDefault(@CurrentUser() user: User) {
    const template = await this.emailTemplateService.findDefault(user.id)
    if (!template) {
      return null
    }
    return template
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get email template by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const template = await this.emailTemplateService.findOne(id, user.id)
    return template
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update email template' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmailTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.emailTemplateService.update(id, updateDto, user.id)
  }

  @Put(':id/set-default')
  @ApiOperation({ summary: 'Set email template as default' })
  async setDefault(@Param('id') id: string, @CurrentUser() user: User) {
    return this.emailTemplateService.setDefault(id, user.id)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete email template' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.emailTemplateService.remove(id, user.id)
  }

  @Post('init-defaults')
  @ApiOperation({ summary: 'Initialize default email templates for current user' })
  async initDefaults(@CurrentUser() user: User) {
    try {
      await this.emailTemplateInitService.createDefaultTemplatesForUser(user.id)
      return {
        success: true,
        message: 'Default templates initialized successfully',
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to initialize default templates')
    }
  }
}
