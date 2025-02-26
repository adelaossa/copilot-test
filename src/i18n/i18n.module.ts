import { Module } from '@nestjs/common';
import { I18nModule as NestI18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { TranslationService } from './translation.service';

@Module({
  imports: [
    NestI18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname),
        watch: true,
      },
    }),
  ],
  providers: [TranslationService],
  exports: [NestI18nModule, TranslationService],
})
export class I18nModule {}