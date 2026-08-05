import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_TRANSFORM_RESPONSE } from '@src/common/decorator/skip-transform.decorator';

export interface Response<T> {
  body: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  constructor(private readonly reflector = new Reflector()) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRANSFORM_RESPONSE,
      [context.getHandler(), context.getClass()],
    );
    if (skipTransform) {
      return next.handle();
    }

    const controllerName = context.getClass().name;
    return next.handle().pipe(
      map((data) => {
        // 判断是否是飞书事件回调
        if (
          ['FeishuEventController', 'FeishuCallbackController'].includes(
            controllerName,
          )
        ) {
          return data;
        }
        if (data?.code && data?.message) {
          return data;
        }
        return { code: 200, body: data, message: '请求成功' };
      }),
    );
  }
}
