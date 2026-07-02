import { SetMetadata } from '@nestjs/common';

export const SKIP_TRANSFORM_RESPONSE = 'skipTransformResponse';

export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_RESPONSE, true);
