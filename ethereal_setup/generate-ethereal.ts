import nodemailer from 'nodemailer'

async function main() {
    const account = await nodemailer.createTestAccount()

    console.log('Ethereal Email Account:\n')
    console.log('User:', account.user)
    console.log('Pass:', account.pass)
    console.log('Host:', account.smtp.host)
    console.log('Port:', account.smtp.port)
    console.log('Secure:', account.smtp.secure)
    console.log('Mailbox URL:', account.web, '\n')
}

main().catch(console.error)

// to run this: npx ts-node path/to/generate-ethereal.ts

/**
 * actuellement:
 * 
 * User: zpib7n47qwquyanp@ethereal.email
 * Pass: 3pDXZv8pYmZPnjGg5A
 * Host: smtp.ethereal.email
 * Port: 587
 * Secure: false
 * Mailbox URL: https://ethereal.email 
 */