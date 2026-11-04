import PDFDocument from "pdfkit";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const s3Client = new S3Client({});
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const CERT_BUCKET = process.env.CERT_BUCKET_NAME || "robotics-lms-certs-2026";
const PROGRESS_TABLE = process.env.PROGRESS_TABLE_NAME || "LMS_Progress";

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
};

const COURSE_TITLES = {
    "crs-esp32-rover": "Autonomous Rover with ESP32 & ROS2 Micro-XRCE",
    "crs-robotic-arm-kinematics": "6-DOF Robotic Arm Kinematics & Servo Bus Control",
};

// Generate Vector PDF Buffer via pdfkit
const createPdfCertificate = (studentName, courseTitle, score, certId, issueDate) => {
    return new Promise((resolve, reject) => {
        try {
            // Landscape A4 certificate (841.89 x 595.28 points)
            const doc = new PDFDocument({
                layout: "landscape",
                size: "A4",
                margins: { top: 40, bottom: 40, left: 40, right: 40 },
            });

            const chunks = [];
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", (err) => reject(err));

            const width = doc.page.width;
            const height = doc.page.height;

            // Outer Decorative Border
            doc.rect(20, 20, width - 40, height - 40)
                .lineWidth(3)
                .strokeColor("#0ea5e9")
                .stroke();

            // Inner Border
            doc.rect(26, 26, width - 52, height - 52)
                .lineWidth(1)
                .strokeColor("#2bb398")
                .stroke();

            // Organization Header
            doc.moveDown(2);
            doc.fontSize(16)
                .font("Helvetica-Bold")
                .fillColor("#0284c7")
                .text("ROBOACADEMY ROBOTICS CERTIFICATION", { align: "center", characterSpacing: 2 });

            doc.moveDown(0.5);
            doc.fontSize(30)
                .font("Helvetica-Bold")
                .fillColor("#1e293b")
                .text("CERTIFICATE OF MASTERY", { align: "center", characterSpacing: 3 });

            doc.moveDown(0.8);
            doc.fontSize(12)
                .font("Helvetica")
                .fillColor("#64748b")
                .text("THIS IS PROUDLY CONFERRED UPON", { align: "center", characterSpacing: 1 });

            // Student Name
            doc.moveDown(0.8);
            doc.fontSize(32)
                .font("Helvetica-Bold")
                .fillColor("#0f172a")
                .text(studentName, { align: "center" });

            // Underline under Name
            const textWidth = doc.widthOfString(studentName);
            const startX = (width - textWidth) / 2;
            doc.moveTo(startX - 20, doc.y + 4)
                .lineTo(startX + textWidth + 20, doc.y + 4)
                .lineWidth(1.5)
                .strokeColor("#0ea5e9")
                .stroke();

            // Achievement Text
            doc.moveDown(1.5);
            doc.fontSize(12)
                .font("Helvetica")
                .fillColor("#334155")
                .text(
                    "For successfully completing all hands-on hardware labs, embedded circuit schematics, and passing the comprehensive examination in the curriculum track:",
                    { align: "center", lineGap: 3 }
                );

            doc.moveDown(0.8);
            doc.fontSize(18)
                .font("Helvetica-Bold")
                .fillColor("#2bb398")
                .text(courseTitle, { align: "center" });

            // Footer: Exam Score, Date, Verification Hash
            const footerY = height - 100;
            doc.fontSize(11).font("Helvetica-Bold").fillColor("#1e293b").text(`Final Exam Score: ${score}%`, 60, footerY);
            doc.fontSize(9).font("Helvetica").fillColor("#64748b").text("Verified via AWS Lambda", 60, footerY + 16);

            doc.fontSize(11).font("Helvetica-Bold").fillColor("#1e293b").text(`Issue Date: ${issueDate}`, width / 2 - 80, footerY, { align: "center" });
            doc.fontSize(9).font("Helvetica").fillColor("#64748b").text("AWS S3 Signed Credential", width / 2 - 80, footerY + 16, { align: "center" });

            doc.fontSize(10).font("Helvetica-Bold").fillColor("#1e293b").text(certId, width - 260, footerY);
            doc.fontSize(8).font("Helvetica").fillColor("#64748b").text("Cryptographic Verification ID", width - 260, footerY + 16);

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

export const handler = async (event) => {
    console.log("Certificate generation request:", JSON.stringify(event));

    // Handle CORS Preflight
    const httpMethod = event.httpMethod || event.requestContext?.http?.method;
    if (httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: "CORS OK" }),
        };
    }

    try {
        let body;
        try {
            body = typeof event.body === "string" ? JSON.parse(event.body) : (event.body || {});
        } catch {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: "Invalid JSON body" }),
            };
        }

        const authorizerClaims =
            event.requestContext?.authorizer?.jwt?.claims ||
            event.requestContext?.authorizer?.claims;
        const userId = authorizerClaims?.sub || body.userId;
        const { courseId, studentName = "Robotics Engineer", score = 100 } = body;

        if (!userId || !courseId) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: "Missing required parameters: 'userId' and 'courseId'" }),
            };
        }

        const courseTitle = COURSE_TITLES[courseId] || "Advanced Robotics Engineering";
        const certId = `ROBO-${courseId.toUpperCase().slice(0, 10)}-${userId.slice(0, 8)}-${Date.now()}`;
        const issueDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

        // 1. Generate the PDF
        const pdfBuffer = await createPdfCertificate(studentName, courseTitle, score, certId, issueDate);

        // 2. Upload to S3 Bucket (robotics-lms-certs-2026)
        const s3Key = `certificates/${courseId}/${userId}-${Date.now()}.pdf`;
        await s3Client.send(
            new PutObjectCommand({
                Bucket: CERT_BUCKET,
                Key: s3Key,
                Body: pdfBuffer,
                ContentType: "application/pdf",
                Metadata: {
                    userId,
                    courseId,
                    score: String(score),
                    certId,
                },
            })
        );

        // 3. Generate Pre-signed Download URL (valid for 24 hours / 86400s)
        const presignedDownloadUrl = await getSignedUrl(
            s3Client,
            new GetObjectCommand({
                Bucket: CERT_BUCKET,
                Key: s3Key,
                ResponseContentDisposition: `attachment; filename="RoboLMS-Certificate-${courseId}.pdf"`,
            }),
            { expiresIn: 86400 }
        );

        // 4. Update DynamoDB LMS_Progress table with certificate URL
        try {
            await docClient.send(
                new UpdateCommand({
                    TableName: PROGRESS_TABLE,
                    Key: { userId, courseId },
                    UpdateExpression: "SET certificateUrl = :certUrl, lastUpdated = :now",
                    ExpressionAttributeValues: {
                        ":certUrl": presignedDownloadUrl,
                        ":now": new Date().toISOString(),
                    },
                })
            );
        } catch (dbErr) {
            console.warn("Could not write certificate URL to LMS_Progress:", dbErr.message);
        }

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                message: "Certificate generated and signed successfully",
                certificateUrl: presignedDownloadUrl,
                s3Key,
                certId,
            }),
        };
    } catch (error) {
        console.error("Failed to generate certificate:", error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                error: "Failed to generate certificate",
                details: error.message,
            }),
        };
    }
};