import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class TranslationService {
  constructor(private readonly i18n: I18nService) {}

  translate(key: string, lang: string = 'en', args: object = {}): string {
    return this.i18n.translate(key, { lang, args });
  }

  async translateAsync(key: string, lang: string = 'en', args: object = {}): Promise<string> {
    return this.i18n.translate(key, { lang, args });
  }
}