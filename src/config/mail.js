export default {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  secure: process.env.DB_SECURE,
  auth: {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS
  },
  default: {
    from: 'Equipe GoBarber <noreply@gobarber.com.br>'
  }
}