import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ErrorCode } from '../constants/error.constants';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = parseInt(value, 10);
    
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException({
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: 'ID must be a positive integer',
      });
    }
    
    return id;
  }
}