#import <Foundation/Foundation.h>
#import <ImageIO/ImageIO.h>
#import <CoreVideo/CoreVideo.h>
#import <Vision/Vision.h>

static CVPixelBufferRef CreatePixelBuffer(CGImageRef image) {
  size_t width = CGImageGetWidth(image);
  size_t height = CGImageGetHeight(image);
  NSDictionary *pixelAttributes = @{
    (__bridge NSString *)kCVPixelBufferCGImageCompatibilityKey : @YES,
    (__bridge NSString *)kCVPixelBufferCGBitmapContextCompatibilityKey : @YES,
  };
  CVPixelBufferRef buffer = NULL;
  CVReturn status = CVPixelBufferCreate(
      kCFAllocatorDefault, width, height, kCVPixelFormatType_32BGRA,
      (__bridge CFDictionaryRef)pixelAttributes, &buffer);
  if (status != kCVReturnSuccess || !buffer) {
    fprintf(stderr, "CVPixelBufferCreate failed: %d\n", status);
    return NULL;
  }

  CVPixelBufferLockBaseAddress(buffer, 0);
  CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
  CGContextRef context = CGBitmapContextCreate(
      CVPixelBufferGetBaseAddress(buffer), width, height, 8,
      CVPixelBufferGetBytesPerRow(buffer), colorSpace,
      kCGImageAlphaPremultipliedFirst | kCGBitmapByteOrder32Little);
  if (!context) {
    CGColorSpaceRelease(colorSpace);
    CVPixelBufferUnlockBaseAddress(buffer, 0);
    CVPixelBufferRelease(buffer);
    return NULL;
  }
  CGContextDrawImage(context, CGRectMake(0, 0, width, height), image);
  CGContextRelease(context);
  CGColorSpaceRelease(colorSpace);
  CVPixelBufferUnlockBaseAddress(buffer, 0);
  return buffer;
}

static NSString *RecognizedTextForImage(NSString *path) {
  NSURL *url = [NSURL fileURLWithPath:path];
  CGImageSourceRef source =
      CGImageSourceCreateWithURL((__bridge CFURLRef)url, NULL);
  if (!source) {
    fprintf(stderr, "cannot open image: %s\n", path.UTF8String);
    return nil;
  }
  CGImageRef cgImage = CGImageSourceCreateImageAtIndex(source, 0, NULL);
  CFRelease(source);
  if (!cgImage) {
    fprintf(stderr, "cannot decode image: %s\n", path.UTF8String);
    return nil;
  }

  __block NSArray<VNRecognizedTextObservation *> *completedResults = nil;
  VNRecognizeTextRequest *request = [[VNRecognizeTextRequest alloc]
      initWithCompletionHandler:^(VNRequest *completedRequest,
                                  NSError *handlerError) {
        if (handlerError) {
          fprintf(stderr, "handler error: %s\n",
                  handlerError.localizedDescription.UTF8String);
          return;
        }
        completedResults = completedRequest.results;
      }];
  request.recognitionLevel = VNRequestTextRecognitionLevelFast;
  request.recognitionLanguages = @[ @"zh-Hans", @"en-US" ];
  request.usesLanguageCorrection = YES;
  request.usesCPUOnly = YES;

  CVPixelBufferRef pixelBuffer = CreatePixelBuffer(cgImage);
  CGImageRelease(cgImage);
  if (!pixelBuffer) {
    return nil;
  }
  VNImageRequestHandler *handler =
      [[VNImageRequestHandler alloc] initWithCVPixelBuffer:pixelBuffer options:@{}];
  if (!handler) {
    fprintf(stderr, "cannot create VNImageRequestHandler: %s\n",
            path.UTF8String);
    CVPixelBufferRelease(pixelBuffer);
    return nil;
  }
  NSError *error = nil;
  BOOL performed = [handler performRequests:@[ request ] error:&error];
  fprintf(stderr, "performed=%d handler=%p cg=%p error=%p results=%p\n",
          performed ? 1 : 0, (__bridge void *)handler, (void *)cgImage,
          (__bridge void *)error, (__bridge void *)completedResults);
  if (!performed) {
    fprintf(stderr, "OCR failed: %s\n", path.UTF8String);
    if (error) {
      fprintf(stderr, "domain=%s code=%ld description=%s\n",
              error.domain.UTF8String, (long)error.code,
              error.localizedDescription.UTF8String);
    }
    CVPixelBufferRelease(pixelBuffer);
    return nil;
  }
  CVPixelBufferRelease(pixelBuffer);

  NSArray<VNRecognizedTextObservation *> *observations = completedResults;
  if (!observations) {
    fprintf(stderr, "no OCR results: %s\n", path.UTF8String);
    return nil;
  }
  NSArray<VNRecognizedTextObservation *> *sorted =
      [observations sortedArrayUsingComparator:^NSComparisonResult(
                        VNRecognizedTextObservation *a,
                        VNRecognizedTextObservation *b) {
        if (fabs(a.boundingBox.origin.y - b.boundingBox.origin.y) > 0.01) {
          return a.boundingBox.origin.y > b.boundingBox.origin.y
                     ? NSOrderedAscending
                     : NSOrderedDescending;
        }
        return a.boundingBox.origin.x < b.boundingBox.origin.x
                   ? NSOrderedAscending
                   : NSOrderedDescending;
      }];

  NSMutableArray<NSString *> *lines = [NSMutableArray array];
  for (VNRecognizedTextObservation *observation in sorted) {
    VNRecognizedText *candidate = [[observation topCandidates:1] firstObject];
    if (candidate.string.length > 0) {
      [lines addObject:candidate.string];
    }
  }
  return [lines componentsJoinedByString:@"\n"];
}

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc != 2) {
      fprintf(stderr, "usage: %s <image>\n", argv[0]);
      return 2;
    }
    NSString *text = RecognizedTextForImage(
        [NSString stringWithUTF8String:argv[1]]);
    if (!text) {
      return 1;
    }
    printf("%s\n", text.UTF8String);
  }
  return 0;
}
