import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

/**
 * S3/CloudFront 이미지 URL을 생성하는 헬퍼 함수
 */
export function getImageUrl(imageName: string): string {
  const cloudfrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;

  if (cloudfrontUrl) {
    // CloudFront URL이 설정되어 있으면 CloudFront를 통해 제공
    return `${cloudfrontUrl}/images/${imageName}`;
  }

  // CloudFront가 없으면 S3 직접 접근 (퍼블릭 버킷인 경우)
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  return `https://${bucket}.s3.${region}.amazonaws.com/images/${imageName}`;
}
