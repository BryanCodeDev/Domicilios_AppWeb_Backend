const { z } = require('zod');
const AppError = require('../utils/AppError');

const validate = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query };
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        campo: e.path.join('.'),
        mensaje: e.message
      }));
      throw new AppError(`Error de validación: ${JSON.stringify(errors)}`, 400);
    }
    req.validated = result.data;
    next();
  };
};

const parseBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        campo: e.path.join('.'),
        mensaje: e.message
      }));
      throw new AppError(`Error de validación: ${JSON.stringify(errors)}`, 400);
    }
    req.body = result.data;
    next();
  };
};

const schemas = {
  register: z.object({
    nombre: z.string().min(2, 'Nombre muy corto').max(100),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres').max(100),
    rol: z.enum(['cliente', 'repartidor', 'negocio']),
    phone: z.string().optional()
  }),
  login: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Password requerido')
  }),
  createBusiness: z.object({
    nombre: z.string().min(2).max(150),
    descripcion: z.string().optional(),
    categoria: z.string().min(2).max(80),
    direccion: z.string().min(5).max(255),
    lat: z.number().optional(),
    lng: z.number().optional(),
    logo_url: z.string().url().optional(),
    horario: z.string().optional()
  }),
  createProduct: z.object({
    business_id: z.string().uuid(),
    nombre: z.string().min(2).max(150),
    descripcion: z.string().optional(),
    precio: z.number().positive('Precio debe ser mayor a 0'),
    imagen_url: z.string().url().optional(),
    disponible: z.boolean().optional()
  }),
  createOrder: z.object({
    business_id: z.string().uuid(),
    items: z.array(z.object({
      product_id: z.string().uuid(),
      cantidad: z.number().int().positive().default(1)
    })).min(1, 'El pedido debe tener al menos un producto'),
    direccion_entrega: z.string().min(5).max(255),
    lat_entrega: z.number().optional(),
    lng_entrega: z.number().optional(),
    notas: z.string().optional()
  }),
  createPayment: z.object({
    order_id: z.string().uuid()
  }),
  createRating: z.object({
    order_id: z.string().uuid(),
    to_user_id: z.string().uuid(),
    rol_calificado: z.enum(['repartidor', 'negocio']),
    puntaje: z.number().int().min(1).max(5),
    comentario: z.string().optional()
  }),
  refreshToken: z.object({
    refreshToken: z.string()
  }),
  fcmToken: z.object({
    fcm_token: z.string()
  }),
  forgotPassword: z.object({
    email: z.string().email('Email inválido')
  }),
  resetPassword: z.object({
    token: z.string(),
    newPassword: z.string().min(6, 'Mínimo 6 caracteres')
  })
};

module.exports = { validate, parseBody, schemas };
