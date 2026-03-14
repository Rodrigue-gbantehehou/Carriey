PERSONAS = [
  {
    'sector': 'Informatique & Tech',
    'levels': {
      'none': {
        'profile': { 'name': 'Bakary Diallo', 'title': 'Étudiant en Informatique', 'email': 'bakary@example.com', 'phone': '+229 97 00 00 01', 'location': 'Cotonou, Bénin', 'photo': '' },
        'summary': 'Étudiant en fin de cycle licence, passionné par le développement d\'applications mobiles et web. À la recherche d\'un premier stage ou emploi.',
        'experience': [
          { 'position': 'Projet de Fin d\'Études', 'company': 'Université d\'Abomey-Calavi', 'period': '2023', 'tasks': ['Conception et réalisation d\'une application de gestion de stock pour PME.'] }
        ],
        'education': [
          { 'degree': 'Licence en Informatique (en cours)', 'school': 'UAC', 'period': '2021 - Présent', 'description': 'Moyenne générale: 16/20.' }
        ],
        'skills': { 'groups': [{ 'label': 'Languages', 'items': ['Java', 'Python', 'Dart'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Natif' }, { 'name': 'Anglais', 'level': 'Scolaire' }]
      },
      'junior': {
        'profile': { 'name': 'Idriss Soro', 'title': 'Développeur Junior', 'email': 'idriss@example.com', 'phone': '+229 97 11 22 33', 'location': 'Cotonou, Bénin', 'photo': '' },
        'summary': 'Développeur Full Stack avec 2 ans d\'expérience. Motivé par l\'apprentissage continu et les défis techniques.',
        'experience': [
          { 'position': 'Développeur Web', 'company': 'Startup-Bénin', 'period': '2022 - Présent', 'tasks': ["Développement de fonctionnalités frontend avec Next.js et intégration d'API."] },
          { 'position': 'Stagiaire Développeur', 'company': 'Digit-Plus', 'period': '2021 (6 mois)', 'tasks': ['Maintenance corrective sur des sites PHP/MySQL.'] }
        ],
        'education': [
          { 'degree': 'Licence en Informatique', 'school': 'ESGIS', 'period': '2019 - 2022', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Web', 'items': ['React', 'Next.js', 'Typescript', 'Node.js'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Natif' }, { 'name': 'Anglais', 'level': 'Intermédiaire' }]
      },
      'mid': {
        'profile': { 'name': 'Jean Dupont', 'title': 'Développeur Full Stack Confirmé', 'email': 'jean@example.com', 'phone': '+229 97 00 00 00', 'location': 'Cotonou, Bénin', 'photo': '' },
        'summary': 'Développeur aguerri avec 4 ans d\'expérience dans la conception d\'architectures web évolutives.',
        'experience': [
          { 'position': 'Développeur Senior', 'company': 'TechCorp', 'period': '2020 - Présent', 'tasks': ['Responsable de la stack technique. Optimisation des performances des bases de données SQL.'] },
          { 'position': 'Développeur Python', 'company': 'DataSoft', 'period': '2019 - 2020', 'tasks': ['Développement de scripts d\'automatisation et d\'API avec FastAPI.' ] }
        ],
        'education': [
          { 'degree': 'Master Informatique', 'school': 'UAC', 'period': '2017 - 2019', 'description': 'Génie logiciel.' }
        ],
        'skills': { 'groups': [{ 'label': 'Expertise', 'items': ['Python', 'Docker', 'React', 'PostgreSQL'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'Professionnel' }]
      },
      'senior': {
        'profile': { 'name': 'Koffi Amétépé', 'title': 'Lead Developer / Architecte Senior', 'email': 'koffi@example.com', 'phone': '+229 98 00 11 22', 'location': 'Lomé, Togo', 'photo': '' },
        'summary': '8 ans d\'expérience dans le leadership technique et la gestion de projets complexes à haute disponibilité.',
        'experience': [
          { 'position': 'Engineering Manager', 'company': 'Fintech Solutions', 'period': '2021 - Présent', 'tasks': ['Encadrement de 3 équipes de développement. Gestion du cycle de vie des produits.'] },
          { 'position': 'Lead Developer Backend', 'company': 'Orange-Africa', 'period': '2018 - 2021', 'tasks': ['Architecture de microservices pour la plateforme de paiement mobile.'] },
          { 'position': 'Développeur Fullstack Senior', 'company': 'Innov-IT', 'period': '2015 - 2018', 'tasks': ['Développement d\'une plateforme SaaS de gestion RH.' ] }
        ],
        'education': [
          { 'degree': 'Diplôme d\'Ingénieur des Travaux', 'school': 'IFRI', 'period': '2012 - 2015', 'description': '' },
          { 'degree': 'Certification Google Cloud Professional Architect', 'school': 'Google Cloud', 'period': '2022', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Architecture', 'items': ['Microservices', 'Kubernetes', 'Cloud Strategy'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'C1 (Advanced)' }]
      },
      'expert': {
        'profile': { 'name': 'Marc Traoré', 'title': 'CTO / Expert en Transformation Digitale', 'email': 'marc@example.com', 'phone': '+229 95 00 11 22', 'location': 'Cotonou, Bénin', 'photo': '' },
        'summary': 'Plus de 15 ans d\'expérience dans la direction technologique et le conseil stratégique pour grands comptes.',
        'experience': [
          { 'position': 'CTO & Co-fondateur', 'company': 'Global African Tech', 'period': '2019 - Présent', 'tasks': ['Définition de la roadmap technologique et levées de fonds.'] },
          { 'position': 'Directeur Technique', 'company': 'MTN Group', 'period': '2012 - 2019', 'tasks': ['Supervision des infrastructures IT sur la zone Afrique de l\'Ouest.' ] },
          { 'position': 'Architecte Senior Cloud', 'company': 'Capgemini Paris', 'period': '2008 - 2012', 'tasks': ['Consortium technique sur des projets gouvernementaux.'] }
        ],
        'education': [
          { 'degree': 'Executive Master specialized in Digital Transformation', 'school': 'HEC Paris', 'period': '2020 - 2021', 'description': '' },
          { 'degree': 'Doctorat en Intelligence Artificielle', 'school': 'Université Paris Sud', 'period': '2005 - 2008', 'description': '' },
          { 'degree': 'Diplôme d\'Ingénieur', 'school': 'Polytechnique', 'period': '2000 - 2005', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Direction', 'items': ['Gouvernance IT', 'Stratégie IA', 'Cyber-sécurité'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'Bilingue' }]
      }
    }
  },
  {
    'sector': 'Marketing & Com',
    'levels': {
      'none': {
        'profile': { 'name': 'Sarah Koffi', 'title': 'Jeune Diplômée Marketing', 'email': 'sarah@example.com', 'phone': '+225 01 02 03 04', 'location': 'Abidjan, Côte d\'Ivoire', 'photo': '' },
        'summary': 'Diplômée récemment d\'un Master en Marketing. Créative et proactive, prête à relever de nouveaux défis.',
        'experience': [
          { 'position': 'Chargée de Com (Stage)', 'company': 'Voodoo Group', 'period': '2023 (4 mois)', 'tasks': ['Aide à la création de contenus pour les réseaux sociaux.'] }
        ],
        'education': [
          { 'degree': 'Master 2 Marketing Digital', 'school': 'ESCAE', 'period': '2021 - 2023', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Softs', 'items': ['Créativité', 'Organisation', 'Travail d\'équipe'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Natif' }]
      },
      'junior': {
        'profile': { 'name': 'Aïcha Soro', 'title': 'Chargée de Communication Digitale', 'email': 'aicha@example.com', 'phone': '+225 07 44 55 66', 'location': 'Abidjan, Côte d\'Ivoire', 'photo': '' },
        'summary': '2 ans d\'expérience dans le community management et la rédaction web.',
        'experience': [
          { 'position': 'Social Media Manager', 'company': 'Agency-X', 'period': '2022 - Présent', 'tasks': ['Gestion d\'un portefeuille de 5 clients. Augmentation de l\'engagement de 30%.' ] },
          { 'position': 'Rédactrice Web Junior', 'company': 'Actu-Terre', 'period': '2021 - 2022', 'tasks': ['Rédaction d\'articles optimisés SEO.' ] }
        ],
        'education': [
          { 'degree': 'Licence en Communication', 'school': 'ISTC Polytechnique', 'period': '2018 - 2021', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Outils', 'items': ['Canva', 'Meta Suite', 'WordPress'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Natif' }, { 'name': 'Anglais', 'level': 'B1' }]
      },
      'mid': {
        'profile': { 'name': 'Amina Koffi', 'title': 'Responsable Marketing Confirmée', 'email': 'amina@example.com', 'phone': '+229 96 11 22 33', 'location': 'Ebène, Maurice', 'photo': '' },
        'summary': 'Spécialiste marketing avec 5 ans d\'expertise stratégique.',
        'experience': [
          { 'position': 'Brand Manager Senior', 'company': 'Nestlé Afrique de l\'Ouest', 'period': '2021 - Présent', 'tasks': ['Lancement de 3 nouvelles gammes de produits. Budget annuel de 100k$.'] },
          { 'position': 'Consultante Marketing Digital', 'company': 'Digital Hub', 'period': '2018 - 2021', 'tasks': ['Audit et accompagnement de PME dans leur visibilité en ligne.'] }
        ],
        'education': [
          { 'degree': 'MBA Marketing & Finance', 'school': 'ESCAE', 'period': '2016 - 2018', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Expertise', 'items': ['SEO/SEA', 'Analytics', 'Event Planning'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'B2' }]
      },
      'senior': {
        'profile': { 'name': 'Ibrahim Diakité', 'title': 'Directeur des Opérations Marketing', 'email': 'ib@example.com', 'phone': '+225 08 88 99 00', 'location': 'Abidjan, Côte d\'Ivoire', 'photo': '' },
        'summary': 'Plus de 9 ans de carrière dans le marketing opérationnel et la gestion de comptes clés.',
        'experience': [
          { 'position': 'Directeur Marketing Côte d\'Ivoire', 'company': 'CFAO Retail', 'period': '2020 - Présent', 'tasks': ['Supervision des opérations marketing pour tout le réseau de distribution.'] },
          { 'position': 'Responsable Trade Marketing', 'company': 'Unilever', 'period': '2016 - 2020', 'tasks': ['Optimisation du merchandising et des activations en points de vente.'] },
          { 'position': 'Key Account Manager', 'company': 'Coca-Cola Hellenic', 'period': '2013 - 2016', 'tasks': ['Gestion de la relation avec les grands distributeurs.'] }
        ],
        'education': [
          { 'degree': 'Master en Management de la Distribution', 'school': 'INPHB Yamoussoukro', 'period': '2010 - 2013', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Management', 'items': ['Négociation Grand Compte', 'Supply Chain Marketing'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'Fluent' }]
      },
      'expert': {
        'profile': { 'name': 'Fatou N\'Diaye', 'title': 'Directrice Marketing Régionale EMEA', 'email': 'fatou@example.com', 'phone': '+221 77 11 22 33', 'location': 'Dakar, Sénégal', 'photo': '' },
        'summary': 'Leader visionnaire avec 18 ans d\'expérience dans le pilotage de marques globales en Afrique et Europe.',
        'experience': [
          { 'position': 'CMO (Chief Marketing Officer)', 'company': 'Groupement Sonecom Afrique', 'period': '2018 - Présent', 'tasks': ['Définition de la stratégie de marque pour 15 filiales nationales.'] },
          { 'position': 'Responsable Marketing Europe de l\'Est', 'company': 'Danone Paris', 'period': '2011 - 2018', 'tasks': ['Gestion de marques leaders sur des marchés émergents à forte croissance.'] },
          { 'position': 'Senior Brand Manager North Africa', 'company': 'L\'Oréal Casablanca', 'period': '2005 - 2011', 'tasks': ['Lancement de la division Cosmétique Active sur le Maghreb.'] }
        ],
        'education': [
          { 'degree': 'Mastère Spécialisé Marketing International', 'school': 'ESSEC Business School', 'period': '2004 - 2005', 'description': 'Top de promo.' },
          { 'degree': 'Diplôme de l\'Institut Supérieur de Commerce', 'school': 'Dakar Business School', 'period': '1999 - 2004', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Leadership', 'items': ['P&L Management', 'Global Branding', 'Change Management'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'C2 (Expert)' }, { 'name': 'Espagnol', 'level': 'Intermédiaire' }]
      }
    }
  },
  {
    'sector': 'Santé',
    'levels': {
      'none': {
        'profile': { 'name': 'Marlyse Houéton', 'title': 'Aide-Soignante Stagiaire', 'email': 'marlyse@example.com', 'phone': '+229 94 00 00 00', 'location': 'Porto-Novo, Bénin', 'photo': '' },
        'summary': 'Étudiante en fin de formation aide-soignante. Très investie dans l\'accompagnement des personnes âgées.',
        'experience': [
          { 'position': 'Stagiaire Aide-Soignante', 'company': 'Centre Hospitalier HUB', 'period': '2023 (3 mois)', 'tasks': ['Aide à la toilette, repas et confort des patients.'] }
        ],
        'education': [
          { 'degree': 'Diplôme de fin d\'études (en cours)', 'school': 'École de Santé du Sud', 'period': '2022 - 2024', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Compétences', 'items': ['Empathie', 'Soins de base', 'Hygiène'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Courant' }, { 'name': 'Fon', 'level': 'Natif' }]
      },
      'junior': {
        'profile': { 'name': 'Sarah Lawson', 'title': 'Infirmière D.E.', 'email': 'sarah@example.com', 'phone': '+229 94 77 88 99', 'location': 'Lomé, Togo', 'photo': '' },
        'summary': 'Infirmière Diplômée d\'État avec 2 ans d\'exercice en milieu hospitalier. Rigoureuse et réactive.',
        'experience': [
          { 'position': 'Infirmière en Médecine Générale', 'company': 'Clinique de l\'Espoir', 'period': '2022 - Présent', 'tasks': ['Administration de soins, suivi des constantes vitales, gestion des pansements.'] },
          { 'position': 'Infirmière Vacataire', 'company': 'Hôpital St Jean', 'period': '2021-2022', 'tasks': ['Remplacements ponctuels en service de gériatrie.'] }
        ],
        'education': [
          { 'degree': 'Diplôme d\'État d\'Infirmier', 'school': 'ENAM Lomé', 'period': '2018 - 2021', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Soins', 'items': ['Premiers secours', 'Pansements complexes', 'Prise de sang'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }]
      },
      'mid': {
        'profile': { 'name': 'Dr. Koffi Mensah', 'title': 'Médecin Généraliste de Santé Publique', 'email': 'koffi@example.com', 'phone': '+228 90 00 11 22', 'location': 'Lomé, Togo', 'photo': '' },
        'summary': 'Praticien avec 6 ans d\'expérience. Investi dans les campagnes de prévention et la santé communautaire.',
        'experience': [
          { 'position': 'Médecin Coordonnateur', 'company': 'Plan International', 'period': '2020 - Présent', 'tasks': ['Coordination des programmes de lutte contre le paludisme en zone rurale.'] },
          { 'position': 'Médecin Urgentiste', 'company': 'Hôpital Sylvanus Olympio', 'period': '2017 - 2020', 'tasks': ['Prise en charge des urgences médico-chirurgicales.'] }
        ],
        'education': [
          { 'degree': 'Doctorat d\'État en Médecine', 'school': 'Université de Lomé', 'period': '2009 - 2017', 'description': '' },
          { 'degree': 'Master en Santé Publique', 'school': 'ISP Dakar', 'period': '2021', 'description': 'Formation continue.' }
        ],
        'skills': { 'groups': [{ 'label': 'Clinique', 'items': ['Diagnostic', 'Gestion de programmes de santé', 'Épidémiologie'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'Scientifique' }]
      },
      'senior': {
        'profile': { 'name': 'Dr Alice Traoré', 'title': 'Médecin Spécialiste Gynécologue-Obstétricienne', 'email': 'alice@health.tg', 'phone': '+228 92 11 22 34', 'location': 'Lomé, Togo', 'photo': '' },
        'summary': 'Praticienne spécialiste avec 9 ans d\'expérience dédiée à la santé maternelle et néonatale.',
        'experience': [
          { 'position': 'Gynécologue Senior', 'company': 'Hôpital de la Mère et de l\'Enfant', 'period': '2019 - Présent', 'tasks': ['Suivi de grossesses à haut risque et chirurgie gynécologique.'] },
          { 'position': 'Responsable du Bloc Obstétrical', 'company': 'Clinique Internationale de Lomé', 'period': '2014 - 2018', 'tasks': ['Optimisation des protocoles de prise en charge des accouchements.'] }
        ],
        'education': [
          { 'degree': 'DES en Gynécologie-Obstétrique', 'school': 'CAMES / Université de Lomé', 'period': '2010 - 2014', 'description': '' },
          { 'degree': 'Doctorat en Médecine', 'school': 'UL', 'period': '2003 - 2010', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Spécialité', 'items': ['Chirurgie obstétricale', 'Échographie morphologique'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'Médical' }]
      },
      'expert': {
        'profile': { 'name': 'Pr. Yao Akoto', 'title': 'Chirurgien Chef de Clinique & Doyen', 'email': 'pr.akoto@health.tg', 'phone': '+228 91 11 22 33', 'location': 'Lomé, Togo', 'photo': '' },
        'summary': '20+ ans de carrière. Référence nationale en chirurgie et enseignement supérieur de la médecine.',
        'experience': [
          { 'position': 'Chef de Service Chirurgie Cardiaque', 'company': 'CHU Sylvanus Olympio', 'period': '2012 - Présent', 'tasks': ['Leadership clinique sur plus de 1000 interventions lourdes.'] },
          { 'position': 'Doyen de la Faculté des Sciences de la Santé', 'company': 'Université de Lomé', 'period': '2018 - 2023', 'tasks': ['Gestion administrative et refonte des maquettes pédagogiques.'] },
          { 'position': 'Praticien Hospitalier Attaché', 'company': 'AP-HP Paris', 'period': '2005 - 2012', 'tasks': ['Recherche appliquée sur les prothèses cardiaques innovantes.'] }
        ],
        'education': [
          { 'degree': 'Agrégation de Médecine - Chirurgie Cardiaque', 'school': 'CAMES', 'period': '2011', 'description': 'Mention Très Honorable.' },
          { 'degree': 'Diplôme de Spécialité Universitaire', 'school': 'Université Paris Descartes', 'period': '2003 - 2005', 'description': '' },
          { 'degree': 'Doctorat d\'État en Médecine', 'school': 'Université de Lomé', 'period': '1995 - 2003', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Excellence', 'items': ['Micro-chirurgie', 'Gros Management Hospitalier', 'Recherche Médicale'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'C2 (Expert)' }]
      }
    }
  },
  {'sector': 'Commerce & Vente', 'levels': {'none': {'profile': {'name': 'Jean-Luc Yao', 'title': 'Stagiaire Vendeur Conseil', 'email': 'jeanluc@example.com', 'phone': '+225 01 00 00 00', 'location': "Yamoussoukro, Côte d'Ivoire", 'photo': ''}, 'summary': 'Étudiant en commerce passionné par la relation client et les techniques de vente.', 'experience': [{'position': 'Vendeur (Saisonnier)', 'company': 'Supermarché Prosuma', 'period': '2023 (2 mois)', 'tasks': ['Accueil des clients, réapprovisionnement des rayons et encaissement.']}], 'education': [{'degree': 'BTS Commerce et Management', 'school': 'INP-HB', 'period': '2022 - Présent', 'description': ''}], 'skills': {'groups': [{'label': 'Vente', 'items': ['Accueil client', 'Gestion de caisse', 'Merchandising']}]}, 'languages': [{'name': 'Français', 'level': 'Natif'}]}, 'junior': {'profile': {'name': 'Kouassi Kouamé', 'title': 'Commercial Terrain', 'email': 'kouassi@example.com', 'phone': '+225 05 11 22 33', 'location': "Abidjan, Côte d'Ivoire", 'photo': ''}, 'summary': "Commercial dynamique avec 2 ans d'expérience dans la prospection et la vente de solutions B2B.", 'experience': [{'position': 'Attaché Commercial', 'company': 'Distribution-CI', 'period': '2021 - Présent', 'tasks': ['Prospection de nouveaux clients et suivi du portefeuille existant.', 'Atteinte des objectifs mensuels à 110%.']}], 'education': [{'degree': 'Licence Professionnelle Vente', 'school': 'Pigier Abidjan', 'period': '2018 - 2021', 'description': ''}], 'skills': {'groups': [{'label': 'Soft Skills', 'items': ['Négociation', 'Persuasion', 'Gestion du stress']}]}, 'languages': [{'name': 'Français', 'level': 'Natif'}, {'name': 'Baoulé', 'level': 'Courant'}]}, 'mid': {'profile': {'name': 'Pierre Soglo', 'title': 'Responsable Commercial Régional', 'email': 'pierre@example.com', 'phone': '+229 96 00 11 22', 'location': 'Cotonou, Bénin', 'photo': ''}, 'summary': "Manager commercial avec 7 ans d'expertise dans le secteur de la grande distribution.", 'experience': [{'position': 'Chef de Secteur', 'company': 'Unilever Bénin', 'period': '2019 - Présent', 'tasks': ['Développement des ventes sur la zone Nord Bénin.', "Management d'une équipe de 5 promoteurs."]}, {'position': 'Délégué Commercial', 'company': 'CFAO Motors', 'period': '2016 - 2019', 'tasks': ['Vente de véhicules utilitaires aux entreprises.']}], 'education': [{'degree': 'Master en Management Commercial', 'school': 'GASA Formation', 'period': '2014 - 2016', 'description': ''}], 'skills': {'groups': [{'label': 'Management', 'items': ['Stratégie de vente', 'Analyse KPI', "Coaching d'équipe"]}]}, 'languages': [{'name': 'Français', 'level': 'Maternel'}, {'name': 'Anglais', 'level': 'Professionnel'}]}}},
  {'sector': 'BTP & Ingénierie', 'levels': {'junior': {'profile': {'name': 'Moussa Touré', 'title': 'Conducteur de Travaux Junior', 'email': 'moussa@example.com', 'phone': '+223 70 00 11 22', 'location': 'Bamako, Mali', 'photo': ''}, 'summary': "Jeune ingénieur BTP passionné par le pilotage de chantiers et l'optimisation des ressources.", 'experience': [{'position': 'Aide Conducteur de Travaux', 'company': 'SOGEA-SATOM', 'period': '2022 - Présent', 'tasks': ["Suivi quotidien de l'avancement des travaux.", 'Gestion des approvisionnements en matériaux.']}, {'position': 'Stagiaire Chantier', 'company': 'Ballo BTP', 'period': '2021', 'tasks': ['Lecture de plans et aide au traçage.']}], 'education': [{'degree': 'Ingénieur de Travaux BTP', 'school': 'ENI-ABT Bamako', 'period': '2018 - 2022', 'description': ''}], 'skills': {'groups': [{'label': 'Technique', 'items': ['AutoCAD', 'MS Project', 'Lecture de plans']}]}, 'languages': [{'name': 'Français', 'level': 'Natif'}, {'name': 'Bambara', 'level': 'Natif'}]}}},
]