/**
 * @swagger
 * components:
 *   schemas:
 *     Complaint:
 *       type: object
 *       required:
 *         - complainerId
 *         - createdByAppUserId
 *         - department
 *         - issue
 *         - description
 *       properties:
 *         complainerId:
 *           type: string
 *         createdByAppUserId:
 *           type: string
 *         department:
 *           type: string
 *         issue:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: ["Pending", "Verified", "Forwarded", "In Progress", "Resolved", "Closed"]
 *         attachmentUrl:
 *           type: string
 *           nullable: true
 *       example:
 *         complainerId: "CID00000001"
 *         createdByAppUserId: "A00000001"
 *         department: "Water Department"
 *         issue: "No water supply"
 *         description: "Last 3 days no water"
 *         status: "Pending"
 *         attachmentUrl: null
 */
