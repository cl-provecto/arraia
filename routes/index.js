var express = require('express');
var router = express.Router();
var pool = require('../util/db')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/sucesso', function(req, res, next) {
  res.render('sucesso');
});

router.get('/resultado', function(req, res, next) {
  res.render('resultado');
});

router.get('/resultadof', (req, res) => {
  const querym = `
  WITH somas_por_equipe_categoria AS (
    SELECT
        c.categoria_id,
        UPPER(c.nome_categoria) AS nome_categoria,
        e.nome_equipe,
        SUM(notas[1]) AS soma_quesito_1,
        SUM(notas[2]) AS soma_quesito_2,
        SUM(notas[3]) AS soma_quesito_3,
        SUM(notas[4]) AS soma_quesito_4,
        SUM(notas[5]) AS soma_quesito_5,
        SUM(notas[6]) AS soma_quesito_6,
        SUM(CASE WHEN array_length(notas, 1) >= 7 THEN notas[7] ELSE 0 END) AS soma_quesito_7,
        SUM(notas[1] + notas[2] + notas[3] + notas[4] + notas[5] + notas[6] + CASE WHEN array_length(notas, 1) >= 7 THEN notas[7] ELSE 0 END) AS soma_total,
        ROW_NUMBER() OVER(PARTITION BY c.nome_categoria ORDER BY SUM(notas[1] + notas[2] + notas[3] + notas[4] + notas[5] + notas[6] + CASE WHEN array_length(notas, 1) >= 7 THEN notas[7] ELSE 0 END) DESC) AS rank_categoria
    FROM 
        avaliacoes a
    JOIN 
        categorias c ON a.categoria_id = c.categoria_id
    JOIN 
        equipes e ON a.equipe_id = e.equipe_id
    GROUP BY 
        c.categoria_id, c.nome_categoria, e.nome_equipe
    ORDER by c.categoria_id
  )
  SELECT 
      nome_equipe, 
      nome_categoria,
      soma_total
  FROM 
      somas_por_equipe_categoria
  WHERE 
      rank_categoria = 1;
  `
  pool.query(querym, [], (erro, resultado) => {
    if(erro) {
      res.status(500).send(erro)
    }
    res.render('resultadof', {list: resultado.rows})
  })
});

router.get('/resultadom', (req, res) => {
  const querym = `
  WITH somas_por_equipe_categoria AS (
    SELECT 
        c.categoriam_id,
        UPPER(c.nome_categoria) AS nome_categoria,
        e.nome_equipe,
        SUM(notas[1]) AS soma_quesito_1,
        SUM(notas[2]) AS soma_quesito_2,
        SUM(notas[3]) AS soma_quesito_3,
        SUM(notas[4]) AS soma_quesito_4,
        SUM(notas[5]) AS soma_quesito_5,
        SUM(CASE WHEN array_length(notas, 1) >= 6 THEN notas[6] ELSE 0 END) AS soma_quesito_7,
        SUM(CASE WHEN array_length(notas, 1) >= 7 THEN notas[7] ELSE 0 END) AS soma_quesito_7,
        SUM(notas[1] + notas[2] + notas[3] + notas[4] + notas[5] + CASE WHEN array_length(notas, 1) >= 6 THEN notas[6] ELSE 0 END + CASE WHEN array_length(notas, 1) >= 7 THEN notas[7] ELSE 0 END) AS soma_total,
        ROW_NUMBER() OVER(PARTITION BY c.nome_categoria ORDER BY SUM(notas[1] + notas[2] + notas[3] + notas[4] + notas[5] + CASE WHEN array_length(notas, 1) >= 6 THEN notas[6] ELSE 0 END + CASE WHEN array_length(notas, 1) >= 7 THEN notas[7] ELSE 0 END) DESC) AS rank_categoria
    FROM 
        avaliacoes_m a
    JOIN 
        categorias_m c ON a.categoriam_id = c.categoriam_id
    JOIN 
        equipes e ON a.equipe_id = e.equipe_id
    GROUP BY 
        c.categoriam_id, c.nome_categoria, e.nome_equipe
    ORDER by c.categoriam_id
  )
  SELECT 
      nome_equipe, 
      nome_categoria,
      soma_total
  FROM 
      somas_por_equipe_categoria
  WHERE 
      rank_categoria = 1;
  `
  pool.query(querym, [], (erro, resultado) => {
    if(erro) {
      res.status(500).send(erro)
    }
    res.render('resultadom', {list: resultado.rows})
  })
});

router.get('/listar', (req, res) => {
  pool.query('SELECT * FROM avaliacoes', [], (erro, resultado) => {
    if(erro) {
      res.status(500).send(erro)
    }
    res.render('lista', {lista: resultado.rows})
  })
})

router.get('/add', (req, res) => {
  res.render('form', {filme: {}});
});

router.post('/add', async (req, res) => {
  const {
    equipe_id,
    jurado,
    q_coreografia, q_harmonia, q_alinhamento, q_evolucao, q_animacao, q_casamento, q_figurino,
    n_interpretacao, n_desenvoltura, n_animacao, n_jocosidade, n_integracao, n_figurino,
    c_interpretacao, c_desenvoltura, c_animacao, c_jocosidade, c_integracao, c_figurino,
    r_desenvoltura, r_animacao, r_jocosidade, r_integracao, r_seguranca, r_figurino,
    re_desenvoltura, re_animacao, re_jocosidade, re_integracao, re_seguranca, re_figurino
  } = req.body;

  const categorias = [
    { id: 1, notas: [q_coreografia, q_harmonia, q_alinhamento, q_evolucao, q_animacao, q_casamento, q_figurino] },
    { id: 2, notas: [n_interpretacao, n_desenvoltura, n_animacao, n_jocosidade, n_integracao, n_figurino] },
    { id: 3, notas: [c_interpretacao, c_desenvoltura, c_animacao, c_jocosidade, c_integracao, c_figurino] },
    { id: 4, notas: [r_desenvoltura, r_animacao, r_jocosidade, r_integracao, r_seguranca, r_figurino] },
    { id: 5, notas: [re_desenvoltura, re_animacao, re_jocosidade, re_integracao, re_seguranca, re_figurino] },
  ];

  try {
    await pool.connect();

    for (const categoria of categorias) {
      const insertQuery = `
        INSERT INTO avaliacoes (equipe_id, jurado, categoria_id, notas)
        VALUES ($1, $2, $3, $4)
      `;

      await pool.query(insertQuery, [equipe_id, jurado, categoria.id, categoria.notas]);
    }

    res.redirect('/sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao inserir avaliações');
  }
});

router.get('/addm', (req, res) => {
  res.render('form_m', {filme: {}});
});

router.post('/addm', async (req, res) => {
  const {
    equipe_id,
    jurado,
    q_coreografia, q_harmonia, q_alinhamento, q_evolucao, q_animacao, q_casamento, q_figurino,
    c_interpretacao, c_roteiro, c_postura_cena, c_integracao, c_expressao_corporal,
    n_interpretacao, n_desenvoltura, n_animacao, n_jocosidade, n_integracao, n_figurino,
    r_desenvoltura, r_animacao, r_jocosidade, r_integracao, r_seguranca, r_figurino,
    re_desenvoltura, re_animacao, re_jocosidade, re_integracao, re_seguranca, re_figurino
  } = req.body;

  const categorias_m = [
    { id: 1, notas: [q_coreografia, q_harmonia, q_alinhamento, q_evolucao, q_animacao, q_casamento, q_figurino] },
    { id: 2, notas: [c_interpretacao, c_roteiro, c_postura_cena, c_integracao, c_expressao_corporal] },
    { id: 3, notas: [n_interpretacao, n_desenvoltura, n_animacao, n_jocosidade, n_integracao, n_figurino] },
    { id: 4, notas: [r_desenvoltura, r_animacao, r_jocosidade, r_integracao, r_seguranca, r_figurino] },
    { id: 5, notas: [re_desenvoltura, re_animacao, re_jocosidade, re_integracao, re_seguranca, re_figurino] },
  ];

  try {
    await pool.connect();

    for (const categoria of categorias_m) {
      const insertQuery = `
        INSERT INTO avaliacoes_m (equipe_id, jurado, categoriam_id, notas)
        VALUES ($1, $2, $3, $4)
      `;

      await pool.query(insertQuery, [equipe_id, jurado, categoria.id, categoria.notas]);
    }

    res.redirect('/sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao inserir avaliações');
  }
});


module.exports = router;
