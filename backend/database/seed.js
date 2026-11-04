/**
 * Script de seed - Dados iniciais de demonstração
 * NKG dos Importados
 *
 * Popula o banco com:
 *  - 1 usuário administrador
 *  - 2 clientes de teste
 *  - 16 produtos importados em 6 categorias
 *  - Variações de cor/tamanho em produtos selecionados
 *  - 3 banners para o carrossel da Home
 *  - Configurações da loja
 *  - 1 promoção de teste
 */

const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_ADMIN_USER || process.env.DB_USER,
    password: process.env.DB_ADMIN_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'nkg_importados',
    waitForConnections: true,
    connectionLimit: 2,
  });

  console.log('🌱 Iniciando seed de dados de demonstração...\n');

  // ══════════════════════════════════════════════════
  //  1. USUÁRIOS
  // ══════════════════════════════════════════════════
  console.log('👤 Criando usuários...');
  const senhaAdmin = await bcrypt.hash('Admin@123', 10);
  const senhaCliente = await bcrypt.hash('Cliente@123', 10);

  await pool.query(`
    INSERT INTO usuarios (nome, email, senha_hash, perfil)
    VALUES
      ('Administrador NKG', 'admin@nkg.com', ?, 'admin'),
      ('Maria Silva', 'maria@teste.com', ?, 'cliente'),
      ('João Santos', 'joao@teste.com', ?, 'cliente')
    ON DUPLICATE KEY UPDATE nome = VALUES(nome)
  `, [senhaAdmin, senhaCliente, senhaCliente]);
  console.log('   ✅ Admin: admin@nkg.com | Senha: Admin@123');
  console.log('   ✅ Cliente: maria@teste.com | Senha: Cliente@123');
  console.log('   ✅ Cliente: joao@teste.com | Senha: Cliente@123\n');

  // ══════════════════════════════════════════════════
  //  2. PRODUTOS
  // ══════════════════════════════════════════════════
  console.log('📦 Criando produtos...');

  const produtos = [
    // ── Perfumes ──
    {
      nome: 'Sauvage Eau de Parfum 100ml',
      categoria: 'Perfumes',
      preco: 899.90,
      tag: 'Destaque',
      foto_url: 'https://images.unsplash.com/photo-1594035910387-fea081ac45a6?w=600&q=80',
      estoque_qtd: 25,
      peso_kg: 0.450, largura_cm: 12, altura_cm: 18, comprimento_cm: 12,
      tamanhos: [],
    },
    {
      nome: 'Bleu de Channel Parfum 100ml',
      categoria: 'Perfumes',
      preco: 1199.90,
      tag: 'Premium',
      foto_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80',
      estoque_qtd: 15,
      peso_kg: 0.480, largura_cm: 12, altura_cm: 18, comprimento_cm: 12,
      tamanhos: [],
    },
    {
      nome: 'Invictus Victory Elixir 100ml',
      categoria: 'Perfumes',
      preco: 749.90,
      tag: 'Novo',
      foto_url: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80',
      estoque_qtd: 30,
      peso_kg: 0.420, largura_cm: 10, altura_cm: 16, comprimento_cm: 10,
      tamanhos: [],
    },

    // ── Relógios ──
    {
      nome: 'Relógio Casio G-Shock GA-2100',
      categoria: 'Relógios',
      preco: 1299.90,
      tag: 'Mais Vendido',
      foto_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
      estoque_qtd: 12,
      peso_kg: 0.350, largura_cm: 14, altura_cm: 14, comprimento_cm: 10,
      tamanhos: [],
    },
    {
      nome: 'Relógio Invicta Pro Diver',
      categoria: 'Relógios',
      preco: 849.90,
      tag: 'Destaque',
      foto_url: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&q=80',
      estoque_qtd: 8,
      peso_kg: 0.400, largura_cm: 14, altura_cm: 14, comprimento_cm: 10,
      tamanhos: [],
    },

    // ── Tênis ──
    {
      nome: 'Nike Air Max 90',
      categoria: 'Tênis',
      preco: 699.90,
      tag: 'Mais Vendido',
      foto_url: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=600&q=80',
      estoque_qtd: 40,
      peso_kg: 0.800, largura_cm: 35, altura_cm: 15, comprimento_cm: 25,
      tamanhos: ['38', '39', '40', '41', '42', '43'],
    },
    {
      nome: 'Adidas Yeezy Boost 350 V2',
      categoria: 'Tênis',
      preco: 1599.90,
      tag: 'Premium',
      foto_url: 'https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?w=600&q=80',
      estoque_qtd: 10,
      peso_kg: 0.750, largura_cm: 35, altura_cm: 15, comprimento_cm: 25,
      tamanhos: ['39', '40', '41', '42', '43'],
    },
    {
      nome: 'New Balance 550',
      categoria: 'Tênis',
      preco: 599.90,
      tag: 'Novo',
      foto_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
      estoque_qtd: 22,
      peso_kg: 0.700, largura_cm: 35, altura_cm: 15, comprimento_cm: 25,
      tamanhos: ['38', '39', '40', '41', '42', '43', '44'],
    },

    // ── Eletrônicos ──
    {
      nome: 'AirPods Pro 2ª Geração',
      categoria: 'Eletrônicos',
      preco: 1899.90,
      tag: 'Destaque',
      foto_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&q=80',
      estoque_qtd: 20,
      peso_kg: 0.120, largura_cm: 10, altura_cm: 10, comprimento_cm: 8,
      tamanhos: [],
    },
    {
      nome: 'JBL Charge 5 Caixa de Som',
      categoria: 'Eletrônicos',
      preco: 999.90,
      tag: 'Mais Vendido',
      foto_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
      estoque_qtd: 18,
      peso_kg: 0.960, largura_cm: 22, altura_cm: 10, comprimento_cm: 10,
      tamanhos: [],
    },
    {
      nome: 'Apple Watch Series 9 45mm',
      categoria: 'Eletrônicos',
      preco: 3499.90,
      tag: 'Premium',
      foto_url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&q=80',
      estoque_qtd: 7,
      peso_kg: 0.200, largura_cm: 12, altura_cm: 12, comprimento_cm: 8,
      tamanhos: [],
    },

    // ── Óculos ──
    {
      nome: 'Ray-Ban Aviador Clássico',
      categoria: 'Óculos',
      preco: 799.90,
      tag: 'Destaque',
      foto_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
      estoque_qtd: 30,
      peso_kg: 0.100, largura_cm: 16, altura_cm: 8, comprimento_cm: 8,
      tamanhos: [],
    },
    {
      nome: 'Oakley Holbrook Polarizado',
      categoria: 'Óculos',
      preco: 649.90,
      tag: 'Novo',
      foto_url: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&q=80',
      estoque_qtd: 15,
      peso_kg: 0.110, largura_cm: 16, altura_cm: 8, comprimento_cm: 8,
      tamanhos: [],
    },

    // ── Acessórios ──
    {
      nome: 'Carteira Tommy Hilfiger Couro',
      categoria: 'Acessórios',
      preco: 349.90,
      tag: 'Mais Vendido',
      foto_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
      estoque_qtd: 35,
      peso_kg: 0.150, largura_cm: 14, altura_cm: 2, comprimento_cm: 10,
      tamanhos: [],
    },
    {
      nome: 'Cinto Calvin Klein Reversível',
      categoria: 'Acessórios',
      preco: 299.90,
      tag: 'Destaque',
      foto_url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80',
      estoque_qtd: 20,
      peso_kg: 0.200, largura_cm: 40, altura_cm: 4, comprimento_cm: 5,
      tamanhos: ['P', 'M', 'G', 'GG'],
    },
    {
      nome: 'Mochila Nike Brasilia 9.5',
      categoria: 'Acessórios',
      preco: 249.90,
      tag: 'Novo',
      foto_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
      estoque_qtd: 28,
      peso_kg: 0.600, largura_cm: 30, altura_cm: 45, comprimento_cm: 18,
      tamanhos: [],
    },
  ];

  const produtoIds = [];

  for (const prod of produtos) {
    const [existe] = await pool.query('SELECT id FROM produtos WHERE nome = ?', [prod.nome]);
    if (existe.length > 0) {
      produtoIds.push(existe[0].id);
      console.log(`   ⏭️  Produto já existe: ${prod.nome}`);
      continue;
    }

    const [resultado] = await pool.query(
      `INSERT INTO produtos
        (nome, categoria, preco, tag, foto_url, estoque_qtd, estoque_minimo,
         peso_kg, largura_cm, altura_cm, comprimento_cm, tamanhos_json, ativo)
       VALUES (?, ?, ?, ?, ?, ?, 5, ?, ?, ?, ?, ?, TRUE)`,
      [
        prod.nome, prod.categoria, prod.preco, prod.tag, prod.foto_url,
        prod.estoque_qtd, prod.peso_kg, prod.largura_cm, prod.altura_cm,
        prod.comprimento_cm, JSON.stringify(prod.tamanhos),
      ]
    );
    produtoIds.push(resultado.insertId);
    console.log(`   ✅ ${prod.nome} (R$ ${prod.preco.toFixed(2)})`);
  }
  console.log(`   📊 Total: ${produtoIds.length} produtos\n`);

  // ══════════════════════════════════════════════════
  //  3. VARIAÇÕES (cor/tamanho) para tênis
  // ══════════════════════════════════════════════════
  console.log('🎨 Criando variações de cor...');

  const variacoesTenis = [
    // Nike Air Max 90 (índice 5)
    { idx: 5, cores: [
      { nome: 'Branco/Vermelho', tamanhos: ['38','39','40','41','42','43'], estoque: 6 },
      { nome: 'Preto/Branco',    tamanhos: ['38','39','40','41','42','43'], estoque: 8 },
      { nome: 'Cinza/Azul',      tamanhos: ['39','40','41','42'],          estoque: 4 },
    ]},
    // Adidas Yeezy (índice 6)
    { idx: 6, cores: [
      { nome: 'Bone/Branco', tamanhos: ['39','40','41','42','43'], estoque: 3 },
      { nome: 'Preto',       tamanhos: ['40','41','42'],           estoque: 2 },
    ]},
    // New Balance 550 (índice 7)
    { idx: 7, cores: [
      { nome: 'Branco/Verde',  tamanhos: ['38','39','40','41','42','43','44'], estoque: 5 },
      { nome: 'Branco/Azul',   tamanhos: ['39','40','41','42','43'],          estoque: 4 },
    ]},
  ];

  for (const grupo of variacoesTenis) {
    const produtoId = produtoIds[grupo.idx];
    if (!produtoId) continue;

    for (const cor of grupo.cores) {
      for (const tam of cor.tamanhos) {
        try {
          await pool.query(
            `INSERT INTO produto_variacoes (produto_id, nome, tamanho, estoque_qtd, ativo)
             VALUES (?, ?, ?, ?, TRUE)
             ON DUPLICATE KEY UPDATE estoque_qtd = VALUES(estoque_qtd)`,
            [produtoId, cor.nome, tam, cor.estoque]
          );
        } catch (err) {
          // Ignora duplicados
        }
      }
      console.log(`   ✅ ${produtos[grupo.idx].nome} → ${cor.nome}`);
    }
  }

  // Variações para cinto (índice 14)
  const cintoId = produtoIds[14];
  if (cintoId) {
    for (const tam of ['P', 'M', 'G', 'GG']) {
      try {
        await pool.query(
          `INSERT INTO produto_variacoes (produto_id, nome, tamanho, estoque_qtd, ativo)
           VALUES (?, 'Preto/Marrom', ?, 5, TRUE)
           ON DUPLICATE KEY UPDATE estoque_qtd = VALUES(estoque_qtd)`,
          [cintoId, tam]
        );
      } catch (err) {}
    }
    console.log(`   ✅ Cinto Calvin Klein → Preto/Marrom (P, M, G, GG)`);
  }
  console.log('');

  // ══════════════════════════════════════════════════
  //  4. BANNERS
  // ══════════════════════════════════════════════════
  console.log('🖼️  Criando banners...');

  const [bannersExistentes] = await pool.query('SELECT COUNT(*) AS total FROM banners WHERE excluido_em IS NULL');
  if (bannersExistentes[0].total === 0) {
    const banners = [
      {
        titulo: 'Coleção Premium — Perfumes Importados',
        imagem_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80',
        imagem_url_2: '',
        link_url: '',
        ativo: true, ordem: 1, principal: true,
        posicao_x: 50, posicao_y: 40,
        posicao_x_2: 50, posicao_y_2: 50,
        zoom: 100, zoom_2: 100,
      },
      {
        titulo: 'Tênis Exclusivos — Edições Limitadas',
        imagem_url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&q=80',
        imagem_url_2: '',
        link_url: '',
        ativo: true, ordem: 2, principal: false,
        posicao_x: 50, posicao_y: 50,
        posicao_x_2: 50, posicao_y_2: 50,
        zoom: 100, zoom_2: 100,
      },
      {
        titulo: 'Tecnologia & Estilo — Eletrônicos Importados',
        imagem_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80',
        imagem_url_2: '',
        link_url: '',
        ativo: true, ordem: 3, principal: false,
        posicao_x: 50, posicao_y: 50,
        posicao_x_2: 50, posicao_y_2: 50,
        zoom: 100, zoom_2: 100,
      },
    ];

    for (const b of banners) {
      await pool.query(
        `INSERT INTO banners
          (titulo, imagem_url, imagem_url_2, link_url, ativo, ordem, principal,
           posicao_x, posicao_y, posicao_x_2, posicao_y_2, zoom, zoom_2)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [b.titulo, b.imagem_url, b.imagem_url_2, b.link_url, b.ativo, b.ordem,
         b.principal, b.posicao_x, b.posicao_y, b.posicao_x_2, b.posicao_y_2,
         b.zoom, b.zoom_2]
      );
      console.log(`   ✅ ${b.titulo}`);
    }
  } else {
    console.log('   ⏭️  Banners já existem, pulando...');
  }
  console.log('');

  // ══════════════════════════════════════════════════
  //  5. CONFIGURAÇÕES DA LOJA
  // ══════════════════════════════════════════════════
  console.log('⚙️  Configurando loja...');
  await pool.query(`
    INSERT INTO configuracoes_loja (id, whatsapp, email_suporte, aviso_ativo, aviso_texto)
    VALUES (1, '(86) 99999-9999', 'contato@nkgimportados.com.br', 0, '')
    ON DUPLICATE KEY UPDATE id = id
  `);
  console.log('   ✅ Configurações da loja inseridas\n');

  // ══════════════════════════════════════════════════
  //  6. PROMOÇÃO DE TESTE
  // ══════════════════════════════════════════════════
  console.log('🏷️  Criando promoção de teste...');
  const [promoExistente] = await pool.query('SELECT id FROM promocoes WHERE codigo = ?', ['BEMESTAREI10']);
  if (promoExistente.length === 0) {
    await pool.query(`
      INSERT INTO promocoes (codigo, tipo, valor, ativo, uso_maximo)
      VALUES ('BEMESTAREI10', 'percentual', 10, TRUE, 100)
    `);
    console.log('   ✅ Cupom BEMESTAREI10 → 10% de desconto\n');
  } else {
    console.log('   ⏭️  Promoção já existe\n');
  }

  // ══════════════════════════════════════════════════
  //  RESUMO
  // ══════════════════════════════════════════════════
  const [totalProdutos] = await pool.query('SELECT COUNT(*) AS t FROM produtos WHERE ativo = TRUE AND excluido_em IS NULL');
  const [totalUsuarios] = await pool.query('SELECT COUNT(*) AS t FROM usuarios');
  const [totalBanners] = await pool.query('SELECT COUNT(*) AS t FROM banners WHERE ativo = TRUE AND excluido_em IS NULL');
  const [totalVariacoes] = await pool.query('SELECT COUNT(*) AS t FROM produto_variacoes WHERE ativo = TRUE');
  const [totalPromocoes] = await pool.query('SELECT COUNT(*) AS t FROM promocoes WHERE ativo = TRUE');

  console.log('═══════════════════════════════════════════');
  console.log('  🎉 SEED CONCLUÍDO COM SUCESSO!');
  console.log('═══════════════════════════════════════════');
  console.log(`  📦 Produtos ativos:  ${totalProdutos[0].t}`);
  console.log(`  🎨 Variações:        ${totalVariacoes[0].t}`);
  console.log(`  👤 Usuários:         ${totalUsuarios[0].t}`);
  console.log(`  🖼️  Banners:          ${totalBanners[0].t}`);
  console.log(`  🏷️  Promoções:        ${totalPromocoes[0].t}`);
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  🔑 Login Admin:');
  console.log('     Email: admin@nkg.com');
  console.log('     Senha: Admin@123');
  console.log('');

  await pool.end();
}

seed().catch((err) => {
  console.error('\n❌ Erro no seed:', err);
  process.exit(1);
});
