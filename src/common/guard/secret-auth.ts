import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';

@Injectable()
export class SecretAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const data = request.body;

    try {
      await this.verify(data);
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
    return true;
  }

  private verify(data: Record<string, string>) {
    const secretKey = 'w1JHRBTylvbXFKNP'; // Replace with your actual secret key
    const { signature, ...restData } = data;
    if (!signature) {
      throw new UnauthorizedException('has no signature');
    }

    // Sort keys and construct the string
    const sortedKeys = Object.keys(restData).sort();
    const concatenatedString = sortedKeys
      .map((key) => `${key}=${restData[key]}`)
      .join('&');

    // Append the secret key
    const stringToHash = concatenatedString + secretKey;

    // Generate MD5 hash
    const generatedSignature = createHash('md5')
      .update(stringToHash)
      .digest('hex');

    // Compare the generated signature with the provided signature
    if (generatedSignature !== signature) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
