/**
 * @swagger
 * components:
 *   schemas:
 *     Complainer:
 *       type: object
 *       required:
 *         - name
 *         - taluka
 *         - village
 *       properties:
 *         complainerId:
 *           type: string
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *           nullable: true
 *         taluka:
 *           type: string
 *         village:
 *           type: string
 *         address:
 *           type: string
 *       example:
 *         complainerId: "CID00000001"
 *         name: "Rahul Patil"
 *         phone: "9876543210"
 *         taluka: "Barshi"
 *         village: "Pimpalgaon"
 *         address: "Near Temple"
 */
