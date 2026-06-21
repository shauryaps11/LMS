import stripe from "stripe"
import { Purchase } from "../models/Purchase.js"
import Course from "../models/Course.js"
import User from "../models/User.js"

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

// Stripe Webhooks to Manage Payment Actions
export const stripeWebhooks = async (request, response) => {
    const sig = request.headers['stripe-signature']

    let event
    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
        return response.status(400).send(`Webhook Error: ${err.message}`)
    }

    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntent.id,
            })
            const { purchaseId } = session.data[0].metadata

            const purchaseData = await Purchase.findById(purchaseId)
            const userData = await User.findById(purchaseData.userId)
            const courseData = await Course.findById(purchaseData.courseId.toString())

            courseData.enrolledStudents.push(userData)
            await courseData.save()

            userData.enrolledCourses.push(courseData._id)
            await userData.save()

            purchaseData.status = 'completed'
            await purchaseData.save()
            break
        }
        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntent.id,
            })
            const { purchaseId } = session.data[0].metadata
            const purchaseData = await Purchase.findById(purchaseId)
            purchaseData.status = 'failed'
            await purchaseData.save()
            break
        }
        default:
            console.log(`Unhandled event type ${event.type}`)
    }

    response.json({ received: true })
}
