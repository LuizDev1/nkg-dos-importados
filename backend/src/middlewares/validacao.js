const { z } = require('zod');
const { normalizarCpf, validarCpf } = require('../utils/cpf');

const dataHoraValida = z.string().refine((valor) => {
  const partes = valor.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!partes) return !Number.isNaN(new Date(valor).getTime());

  const [, ano, mes, dia, hora, minuto] = partes;
  const data = new Date(Date.UTC(
    Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto)
  ));

  return data.getUTCFullYear() === Number(ano)
    && data.getUTCMonth() === Number(mes) - 1
    && data.getUTCDate() === Number(dia)
    && data.getUTCHours() === Number(hora)
    && data.getUTCMinutes() === Number(minuto);
}, 'Informe uma data e hora válidas');

const schemas = {
  produto: z.object({
    nome: z.string().trim().min(2).max(150),
    categoria: z.string().trim().max(100).optional().default(''),
    preco: z.coerce.number().finite().positive().max(999999.99),
    tag: z.string().trim().max(100).optional().default(''),
    foto_url: z.union([z.string().url().max(255), z.literal('')]).optional().default(''),
    estoque_qtd: z.coerce.number().int().nonnegative().max(100000),
    peso_kg: z.coerce.number().finite().positive().max(50).default(0.3),
    largura_cm: z.coerce.number().finite().positive().max(200).default(20),
    altura_cm: z.coerce.number().finite().positive().max(200).default(10),
    comprimento_cm: z.coerce.number().finite().positive().max(300).default(30),
  }).strict(),
  autenticacao: z.object({
    nome: z.string().trim().min(2).max(150),
    email: z.string().trim().email().max(150),
    senha: z.string().min(8).max(128),
    cpf: z.string().trim().max(14).refine(validarCpf, 'CPF inválido').transform(normalizarCpf),
  }).strict(),
  login: z.object({
    email: z.string().trim().email().max(150),
    senha: z.string().min(1).max(128),
  }).strict(),
  pedido: z.object({
    tipo_entrega: z.enum(['envio', 'entrega_local']),
    endereco_entrega: z.string().trim().min(5).max(1000),
    cep_entrega: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido').optional(),
    telefone_contato: z.string().trim().min(8).max(20),
    frete_servico_id: z.string().trim().max(30).optional(),
    codigo_promocao: z.string().trim().max(50).optional(),
    itens: z.array(z.object({
      produto_id: z.number().int().positive(),
      quantidade: z.number().int().positive().max(1000),
      preco_unitario: z.number().finite().nonnegative().optional(),
    }).strict()).min(1).max(100),
  }).strict(),
  freteCotacao: z.object({
    cep_destino: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    itens: z.array(z.object({
      produto_id: z.number().int().positive(),
      quantidade: z.number().int().positive().max(1000),
    }).strict()).min(1).max(100),
    servico_id: z.string().trim().max(30).optional(),
  }).strict(),
  promocao: z.object({
    codigo: z.string().trim().min(3).max(50),
    tipo: z.enum(['percentual', 'fixo']),
    valor: z.number().finite().positive(),
    inicio_em: dataHoraValida.optional(),
    fim_em: dataHoraValida.optional(),
    uso_maximo: z.number().int().positive().optional(),
  }).strict().superRefine((dados, contexto) => {
    if (dados.tipo === 'percentual' && dados.valor > 100) {
      contexto.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 100,
        type: 'number',
        inclusive: true,
        path: ['valor'],
        message: 'O percentual não pode ser maior que 100',
      });
    }

    if (dados.inicio_em && dados.fim_em && new Date(dados.fim_em) <= new Date(dados.inicio_em)) {
      contexto.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fim_em'],
        message: 'O fim deve ser posterior ao início',
      });
    }
  }),
  banner: z.object({
    titulo: z.string().trim().max(150).optional().default(''),
    imagem_url: z.string().trim().url().max(500),
    link_url: z.union([z.string().trim().url().max(500), z.literal('')]).optional().default(''),
    ativo: z.boolean().optional().default(true),
    ordem: z.coerce.number().int().min(0).max(10000).optional().default(0),
  }).strict(),
};

function validar(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        mensagem: 'Dados inválidos',
        erros: resultado.error.issues.map((erro) => ({
          campo: erro.path.join('.'),
          mensagem: erro.message,
        })),
      });
    }

    req.body = resultado.data;
    return next();
  };
}

module.exports = { schemas, validar };
