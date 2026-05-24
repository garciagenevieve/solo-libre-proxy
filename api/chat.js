export default async function handler(req, res) {
  // Autoriser uniquement genevievegarcia.fr
  const origin = req.headers.origin || '';
  const allowed = [
    'https://genevievegarcia.fr',
    'https://www.genevievegarcia.fr',
    'http://localhost'
  ];

  if (allowed.some(o => origin.startsWith(o))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { messages } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `Tu es Libre, l'assistante IA bienveillante de Geneviève Garcia pour le collectif Solo & Libre.
Tu réponds aux questions sur ce collectif d'accompagnement pour femmes qui quittent le salariat.
Le collectif Solo & Libre propose un parcours de 3 mois pour clarifier sa cible, trouver ses premiers clients et construire une structure solide.
Réponds en français, de façon chaleureuse, courte (3-4 lignes max), et tutoie.
À la fin encourage à rejoindre le groupe Facebook ou réserver un appel sur genevievegarcia.fr`,
        messages
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Erreur proxy:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
