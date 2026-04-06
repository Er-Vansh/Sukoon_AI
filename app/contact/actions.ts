"use server"

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name")
  const email = formData.get("email")
  const subject = formData.get("subject")
  const message = formData.get("message")

  // For now, we'll just log the submission.
  // In a real application, you would use an email service like Resend or SendGrid.
  console.log("Contact Form Submission:", { name, email, subject, message })
  
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return { success: true, message: "Thank you! Your message has been sent to nitin.860sharma@gmail.com. We'll get back to you soon." }
}
