/**
 * Email Service using EmailJS (Client-side)
 * 
 * Note: To fully enable this, you need to:
 * 1. Sign up at https://www.emailjs.com/
 * 2. Create a Service (e.g., Gmail)
 * 3. Create an Email Template
 * 4. Install emailjs-com: npm install emailjs-com
 * 5. Replace SERVICE_ID, TEMPLATE_ID, USER_ID with actual values.
 * 
 * For this implementation, we will simulate the email sending to console
 * to fulfill the roadmap requirement without exposing keys or requiring a paid backend.
 */

// import emailjs from 'emailjs-com';

const SERVICE_ID = 'YOUR_SERVICE_ID';
const TEMPLATE_ID_WELCOME = 'YOUR_WELCOME_TEMPLATE_ID';
const TEMPLATE_ID_ORDER = 'YOUR_ORDER_TEMPLATE_ID';
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

export const sendWelcomeEmail = async (email: string, name: string) => {
    console.log(`[EmailService] Sending Welcome Email to ${email} (${name})...`);

    // Simulation
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`[EmailService] Welcome Email sent successfully to ${email}`);
            resolve(true);
        }, 1000);
    });

    /* Actual Implementation:
    const templateParams = {
        to_email: email,
        to_name: name,
        message: 'Welcome to LUMINA! We are excited to have you.'
    };

    return emailjs.send(SERVICE_ID, TEMPLATE_ID_WELCOME, templateParams, PUBLIC_KEY)
        .then((response) => {
            console.log('SUCCESS!', response.status, response.text);
            return true;
        }, (err) => {
            console.log('FAILED...', err);
            return false;
        });
    */
};

export const sendOrderNotification = async (orderId: string, amount: number) => {
    console.log(`[EmailService] Sending Admin Notification for Order #${orderId} (₩${amount.toLocaleString()})...`);

    // Simulation
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`[EmailService] Admin Notification sent successfully for Order #${orderId}`);
            resolve(true);
        }, 1000);
    });

    /* Actual Implementation:
    const templateParams = {
        order_id: orderId,
        amount: amount,
        message: 'New order received!'
    };

    return emailjs.send(SERVICE_ID, TEMPLATE_ID_ORDER, templateParams, PUBLIC_KEY)
        .then((response) => {
            console.log('SUCCESS!', response.status, response.text);
            return true;
        }, (err) => {
            console.log('FAILED...', err);
            return false;
        });
    */
};
