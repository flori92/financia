import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { ContactDemoDto } from './contact.dto';

@ApiTags('Contact')
@Controller('contact-demo')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soumettre une demande de démonstration' })
  @ApiResponse({ 
    status: 200, 
    description: 'Demande de démo envoyée avec succès' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Données invalides' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Erreur lors de l\'envoi de l\'email' 
  })
  async submitDemoRequest(@Body() contactDemoDto: ContactDemoDto): Promise<{ message: string }> {
    await this.contactService.sendDemoRequest(contactDemoDto);
    return { 
      message: 'Votre demande de démonstration a été envoyée avec succès. Nous vous contacterons très prochainement.' 
    };
  }
}
