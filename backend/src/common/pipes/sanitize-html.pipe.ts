import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizeHtmlPipe implements PipeTransform {
  // Default configuration for sanitization
  private readonly options = {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'p',
      'a',
      'ul',
      'ol',
      'nl',
      'li',
      'b',
      'i',
      'strong',
      'em',
      'strike',
      'code',
      'hr',
      'br',
      'div',
      'table',
      'thead',
      'caption',
      'tbody',
      'tr',
      'th',
      'td',
      'pre',
      'img',
      'span',
      'figure',
      'figcaption',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'height', 'width'],
      '*': ['class', 'id', 'style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {},
    disallowedTagsMode: 'discard',
  };

  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) return value;

    // If it's a string, sanitize directly
    if (typeof value === 'string') {
      return sanitizeHtml(value, this.options);
    }

    // For DTOs with contentBody property
    if (typeof value === 'object' && value.contentBody) {
      value.contentBody = sanitizeHtml(value.contentBody, this.options);
    }

    return value;
  }
}
