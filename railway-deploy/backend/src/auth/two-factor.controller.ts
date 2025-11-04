import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwoFactorService } from './services/two-factor.service';
import { Enable2FADto, Verify2FADto, Disable2FADto } from './dto/two-factor.dto';

@Controller('auth/2fa')
@UseGuards(JwtAuthGuard)
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Get('generate')
  async generateSecret(@Request() req) {
    return this.twoFactorService.generateSecret(req.user.id);
  }

  @Post('enable')
  async enable(@Request() req, @Body() dto: Enable2FADto) {
    return this.twoFactorService.enable(req.user.id, dto.token);
  }

  @Post('verify')
  async verify(@Request() req, @Body() dto: Verify2FADto) {
    const isValid = await this.twoFactorService.verify(req.user.id, dto.token);
    return { valid: isValid };
  }

  @Post('disable')
  async disable(@Request() req, @Body() dto: Disable2FADto) {
    await this.twoFactorService.disable(req.user.id, dto.password);
    return { message: '2FA désactivé avec succès' };
  }
}
