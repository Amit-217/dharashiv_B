/**
 * @swagger
 * components:
 *   schemas:
 *     AppUser:
 *       type: object
 *       required:
 *         - appUserId
 *         - name
 *         - phone
 *         - password
 *         - secretQuestion
 *         - secretAnswer
 *       properties:
 *         appUserId:
 *           type: string
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         password:
 *           type: string
 *         secretQuestion:
 *           type: string
 *         secretAnswer:
 *           type: string
 *       example:
 *         appUserId: "A0000001"
 *         name: "Amit"
 *         phone: "9876543210"
 *         password: "hashed_password"
 *         secretQuestion: "Your first school?"
 *         secretAnswer: "abc"
 */
