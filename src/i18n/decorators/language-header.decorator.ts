import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Language = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const acceptLanguage = request.headers['accept-language'];
    
    if (!acceptLanguage) return 'en';
    
    // Extract primary language from Accept-Language header
    const primaryLang = acceptLanguage.split(',')[0].trim().split('-')[0];
    
    // Currently support only 'en' and 'es'
    return ['en', 'es'].includes(primaryLang) ? primaryLang : 'en';
  },
);