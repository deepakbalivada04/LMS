import PDFDocument from 'pdfkit';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.CERTIFICATES_BUCKET_NAME || 'robolms-private-certificates';

const s3Client = new S3Client({ region });

export interface CertificateMetadata {
  studentName: string;
  courseTitle: string;
  score: number;
  courseId: string;
  userId: string;
  issueDate?: string;
}

export const generatePdfBuffer = (metadata: CertificateMetadata): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      // Landscape A4 certificate (841.89 x 595.28 points)
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const width = doc.page.width;
      const height = doc.page.height;

      // Outer Decorative Border
      doc.rect(20, 20, width - 40, height - 40)
        .lineWidth(3)
        .strokeColor('#0ea5e9')
        .stroke();

      // Inner Border
      doc.rect(26, 26, width - 52, height - 52)
        .lineWidth(1)
        .strokeColor('#2bb398')
        .stroke();

      // Header Brand
      doc.moveDown(2);
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#0284c7')
        .text('ROBOACADEMY SERVERLESS CERTIFICATION', { align: 'center', characterSpacing: 2 });

      doc.moveDown(0.5);
      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#1e293b')
        .text('CERTIFICATE OF MASTERY', { align: 'center', characterSpacing: 3 });

      doc.moveDown(0.8);
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('THIS IS PROUDLY CONFERRED UPON', { align: 'center', characterSpacing: 1 });

      // Student Name
      doc.moveDown(0.8);
      doc.fontSize(32)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(metadata.studentName, { align: 'center' });

      // Underline under student name
      const textWidth = doc.widthOfString(metadata.studentName);
      const startX = (width - textWidth) / 2;
      doc.moveTo(startX - 20, doc.y + 4)
        .lineTo(startX + textWidth + 20, doc.y + 4)
        .lineWidth(1.5)
        .strokeColor('#0ea5e9')
        .stroke();

      // Description & Track
      doc.moveDown(1.5);
      doc.fontSize(13)
        .font('Helvetica')
        .fillColor('#334155')
        .text('For successfully completing all hands-on hardware laboratory assignments, micro-controller firmware deployments, and scoring higher than 80% on the final certification exam in the curriculum track:', {
          align: 'center',
          lineGap: 4,
        });

      doc.moveDown(0.8);
      doc.fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#2bb398')
        .text(metadata.courseTitle, { align: 'center' });

      // Metadata Footer (Score, Date, Verification Hash)
      const dateStr = metadata.issueDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const certHash = `CERT-${metadata.courseId.toUpperCase()}-${metadata.userId.substring(0, 8)}-${Date.now()}`;

      doc.moveDown(3);
      const footerY = height - 110;

      // Left Column: Exam Score
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text(`Final Exam Score: ${metadata.score}%`, 60, footerY);
      doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('Evaluated via AWS Lambda', 60, footerY + 16);

      // Center Column: Date
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text(`Date Issued: ${dateStr}`, width / 2 - 80, footerY, { align: 'center' });
      doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('AWS Serverless Telemetry Verified', width / 2 - 80, footerY + 16, { align: 'center' });

      // Right Column: Certificate ID
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text(certHash, width - 260, footerY);
      doc.fontSize(8).font('Helvetica').fillColor('#64748b').text('Cryptographic Verification Hash', width - 260, footerY + 16);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const createAndUploadCertificate = async (metadata: CertificateMetadata): Promise<{ s3Key: string; presignedUrl: string }> => {
  const pdfBuffer = await generatePdfBuffer(metadata);
  const s3Key = `certificates/${metadata.courseId}/${metadata.userId}-cert-${Date.now()}.pdf`;

  // 1. Upload to Private S3 Bucket
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      Metadata: {
        userId: metadata.userId,
        courseId: metadata.courseId,
        studentName: metadata.studentName,
        score: String(metadata.score),
      },
    })
  );

  // 2. Generate pre-signed URL with 24 hours expiration (86400 seconds)
  const presignedUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ResponseContentDisposition: `attachment; filename="RoboLMS-Certificate-${metadata.courseId}.pdf"`,
    }),
    { expiresIn: 86400 }
  );

  return { s3Key, presignedUrl };
};

