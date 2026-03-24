PERSONAS = [
  {
    'sector': 'Informatique & Tech',
    'levels': {
      'none': {
        'profile': { 'name': 'Bakary Diallo', 'title': 'Étudiant en Informatique', 'email': 'bakary@example.com', 'phone': '+229 97 00 00 01', 'location': 'Cotonou, Bénin', 'photo': '' },
        'summary': 'Étudiant en fin de cycle licence, passionné par le développement d\'applications mobiles et web. À la recherche d\'un premier stage ou emploi.',
        'experience': [
          { 'role': 'Projet de Fin d\'Études', 'company': 'Université d\'Abomey-Calavi', 'period': '2023', 'bullets': ['Conception et réalisation d\'une application de gestion de stock pour PME.'] }
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
          { 'role': 'Développeur Web', 'company': 'Startup-Bénin', 'period': '2022 - Présent', 'bullets': ["Développement de fonctionnalités frontend avec Next.js et intégration d'API."] },
          { 'role': 'Stagiaire Développeur', 'company': 'Digit-Plus', 'period': '2021 (6 mois)', 'bullets': ['Maintenance corrective sur des sites PHP/MySQL.'] }
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
          { 'role': 'Développeur Senior', 'company': 'TechCorp', 'period': '2020 - Présent', 'bullets': ['Responsable de la stack technique. Optimisation des performances des bases de données SQL.'] },
          { 'role': 'Développeur Python', 'company': 'DataSoft', 'period': '2019 - 2020', 'bullets': ['Développement de scripts d\'automatisation et d\'API avec FastAPI.' ] }
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
          { 'role': 'Engineering Manager', 'company': 'Fintech Solutions', 'period': '2021 - Présent', 'bullets': ['Encadrement de 3 équipes de développement. Gestion du cycle de vie des produits.'] },
          { 'role': 'Lead Developer Backend', 'company': 'Orange-Africa', 'period': '2018 - 2021', 'bullets': ['Architecture de microservices pour la plateforme de paiement mobile.'] },
          { 'role': 'Développeur Fullstack Senior', 'company': 'Innov-IT', 'period': '2015 - 2018', 'bullets': ['Développement d\'une plateforme SaaS de gestion RH.' ] }
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
          { 'role': 'CTO & Co-fondateur', 'company': 'Global African Tech', 'period': '2019 - Présent', 'bullets': ['Définition de la roadmap technologique et levées de fonds.'] },
          { 'role': 'Directeur Technique', 'company': 'MTN Group', 'period': '2012 - 2019', 'bullets': ['Supervision des infrastructures IT sur la zone Afrique de l\'Ouest.' ] },
          { 'role': 'Architecte Senior Cloud', 'company': 'Capgemini Paris', 'period': '2008 - 2012', 'bullets': ['Consortium technique sur des projets gouvernementaux.'] }
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
          { 'role': 'Chargée de Com (Stage)', 'company': 'Voodoo Group', 'period': '2023 (4 mois)', 'bullets': ['Aide à la création de contenus pour les réseaux sociaux.'] }
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
          { 'role': 'Social Media Manager', 'company': 'Agency-X', 'period': '2022 - Présent', 'bullets': ['Gestion d\'un portefeuille de 5 clients. Augmentation de l\'engagement de 30%.' ] },
          { 'role': 'Rédactrice Web Junior', 'company': 'Actu-Terre', 'period': '2021 - 2022', 'bullets': ['Rédaction d\'articles optimisés SEO.' ] }
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
          { 'role': 'Brand Manager Senior', 'company': 'Nestlé Afrique de l\'Ouest', 'period': '2021 - Présent', 'bullets': ['Lancement de 3 nouvelles gammes de produits. Budget annuel de 100k$.'] },
          { 'role': 'Consultante Marketing Digital', 'company': 'Digital Hub', 'period': '2018 - 2021', 'bullets': ['Audit et accompagnement de PME dans leur visibilité en ligne.'] }
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
          { 'role': 'Directeur Marketing Côte d\'Ivoire', 'company': 'CFAO Retail', 'period': '2020 - Présent', 'bullets': ['Supervision des opérations marketing pour tout le réseau de distribution.'] },
          { 'role': 'Responsable Trade Marketing', 'company': 'Unilever', 'period': '2016 - 2020', 'bullets': ['Optimisation du merchandising et des activations en points de vente.'] },
          { 'role': 'Key Account Manager', 'company': 'Coca-Cola Hellenic', 'period': '2013 - 2016', 'bullets': ['Gestion de la relation avec les grands distributeurs.'] }
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
          { 'role': 'CMO (Chief Marketing Officer)', 'company': 'Groupement Sonecom Afrique', 'period': '2018 - Présent', 'bullets': ['Définition de la stratégie de marque pour 15 filiales nationales.'] },
          { 'role': 'Responsable Marketing Europe de l\'Est', 'company': 'Danone Paris', 'period': '2011 - 2018', 'bullets': ['Gestion de marques leaders sur des marchés émergents à forte croissance.'] },
          { 'role': 'Senior Brand Manager North Africa', 'company': 'L\'Oréal Casablanca', 'period': '2005 - 2011', 'bullets': ['Lancement de la division Cosmétique Active sur le Maghreb.'] }
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
        'summary': 'Étudiante en fin de formation aide-soignante. Passionnée par le soin à la personne et l\'accompagnement des patients en gériatrie.',
        'experience': [
          { 'role': 'Stagiaire Aide-Soignante', 'company': 'Centre Hospitalier HUB - Service Gériatrie', 'period': '2023 (3 mois)', 'bullets': ['Aide à la toilette et au confort des patients.', 'Accompagnement lors des repas.', 'Surveillance de l\'état général des résidents.'] }
        ],
        'education': [
          { 'degree': 'Diplôme d\'Aide-Soignant (en cours)', 'school': 'École Nationale de Santé du Sud', 'period': '2022 - 2024', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Soins', 'items': ['Empathie', 'Hygiène hospitalière', 'Protocoles de soin'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Courant' }, { 'name': 'Fon', 'level': 'Natif' }],
        'interests': ['Lecture', 'Bénévolat social', 'Cuisine traditionnelle']
      },
      'junior': {
        'profile': { 'name': 'Sarah Lawson', 'title': 'Infirmière Diplômée d\'État', 'email': 'sarah@example.com', 'phone': '+229 94 77 88 99', 'location': 'Lomé, Togo', 'photo': '' },
        'summary': 'Infirmière réactive avec 2 ans d\'expérience aux urgences. Maîtrise des gestes de premiers secours et de la gestion du stress en milieu critique.',
        'experience': [
          { 'role': 'Infirmière - Service des Urgences', 'company': 'Hôpital Sylvanus Olympio', 'period': '2022 - Présent', 'bullets': ['Triage des patients et évaluation du degré d\'urgence.', 'Administration des soins d\'urgence et monitorage.', 'Collaboration étroite avec l\'équipe médicale pluridisciplinaire.'] },
          { 'role': 'Infirmière Stagiaire', 'company': 'Clinique de l\'Espoir', 'period': '2021 (6 mois)', 'bullets': ['Soins post-opératoires en chirurgie générale.', 'Gestion des dossiers patients informatisés.'] }
        ],
        'education': [
          { 'degree': 'Diplôme d\'État d\'Infirmier', 'school': 'ENAM Togo', 'period': '2018 - 2021', 'description': 'Major de promotion.' }
        ],
        'skills': { 'groups': [{ 'label': 'Technique', 'items': ['Réanimation de base', 'Prélèvements sanguins', 'Pose de cathéters'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'Niveau B1' }],
        'interests': ['Secourisme', 'Fitness', 'Voyages']
      },
      'mid': {
        'profile': { 'name': 'Dr. Koffi Mensah', 'title': 'Médecin Généraliste', 'email': 'koffi@example.com', 'phone': '+228 90 00 11 22', 'location': 'Lomé, Togo', 'photo': '' },
        'summary': 'Médecin polyvalent avec 6 ans d\'expérience clinique. Expert en diagnostic et en médecine communautaire.',
        'experience': [
          { 'role': 'Médecin Coordonnateur Santé Publique', 'company': 'ONG Plan International', 'period': '2020 - Présent', 'bullets': ['Supervision technique des centres de santé ruraux.', 'Mise en œuvre des programmes de lutte contre le paludisme.', 'Campagnes de sensibilisation et vaccination.'] },
          { 'role': 'Médecin Résident', 'company': 'CHR Lomé-Commune', 'period': '2017 - 2020', 'bullets': ['Consultations de médecine générale.', 'Prise en charge des pathologies infectieuses courantes.'] }
        ],
        'education': [
          { 'degree': 'Doctorat d\'État en Médecine', 'school': 'Faculté des Sciences de la Santé - UL', 'period': '2010 - 2017', 'description': '' },
          { 'degree': 'Master en Santé Publique', 'school': 'Institut de Santé et Développement (ISED)', 'period': '2021', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Expertises', 'items': ['Diagnostic clinique', 'Gestion de programmes de santé', 'Épidémiologie'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'Scientifique' }],
        'interests': ['Échecs', 'Blog médical', 'Randonnée']
      },
      'senior': {
        'profile': { 'name': 'Dr Alice Traoré', 'title': 'Gynécologue-Obstétricienne', 'email': 'alice@health.tg', 'phone': '+228 92 11 22 34', 'location': 'Lomé, Togo', 'photo': '' },
        'summary': '9 ans d\'expérience spécialisée dans la santé maternelle. Passionnée par l\'innovation chirurgicale et la périnatalité.',
        'experience': [
          { 'role': 'Chef du Service Gynécologie', 'company': 'Hôpital de la Mère et de l\'Enfant', 'period': '2019 - Présent', 'bullets': ['Chirurgie gynécologique complexe et coelioscopie.', 'Suivi des grossesses pathologiques.', 'Management de l\'équipe médicale du service.'] },
          { 'role': 'Gynécologue-Obstétricienne', 'company': 'Clinique Internationale de Lomé', 'period': '2014 - 2018', 'bullets': ['Accouchements et césariennes en urgence.', 'Consultations de fertilité.'] }
        ],
        'education': [
          { 'degree': 'Diplôme d\'Études Spécialisées (DES) Gynéco-Obstétrique', 'school': 'Université de Lomé / CAMES', 'period': '2010 - 2014', 'description': '' },
          { 'degree': 'Doctorat en Médecine', 'school': 'Université de Lomé', 'period': '2003 - 2010', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Spécialités', 'items': ['Chirurgie obstétricale', 'Échographie morphologique', 'Planification familiale'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'Médical' }],
        'interests': ['Yoga', 'Lecture scientifique', 'Philanthropie']
      },
      'expert': {
        'profile': { 'name': 'Pr. Yao Akoto', 'title': 'Chirurgien Chef de Clinique & Professeur Agrégé', 'email': 'pr.akoto@health.tg', 'phone': '+228 91 11 22 33', 'location': 'Lomé, Togo', 'photo': '' },
        'summary': 'Plus de 20 ans de contribution à la chirurgie cardiaque et à l\'enseignement médical en Afrique de l\'Ouest.',
        'experience': [
          { 'role': 'Chef de Clinique - Chirurgie Cardiaque', 'company': 'CHU Sylvanus Olympio', 'period': '2012 - Présent', 'bullets': [
            'Pionnier des interventions cardiaques à cœur ouvert au Togo avec plus de 500 opérations réussies.',
            'Développement d\'une unité de soins intensifs spécialisée en cardiologie pédiatrique.',
            'Recherche clinique sur les cardiopathies congénitales et publication de 15 articles internationaux.',
            'Direction des staffs médicaux et formation continue des équipes chirurgicales.',
            'Optimisation des protocoles d\'asepsie et réduction du taux d\'infection post-opératoire de 25%.'
          ] },
          { 'role': 'Doyen de la Faculté des Sciences de la Santé', 'company': 'Université de Lomé', 'period': '2018 - 2023', 'bullets': [
            'Directeur de la stratégie académique et hospitalière pour plus de 2000 étudiants.',
            'Réforme complète du curriculum des études médicales alignée sur les standards internationaux.',
            'Négociation de partenariats stratégiques avec des universités européennes et américaines.',
            'Supervision des thèses de doctorat et des mémoires de spécialité.',
            'Gestion d\'un budget académique annuel de 500M FCFA.'
          ] }
        ],
        'education': [
          { 'degree': 'Agrégation de Médecine (Chirurgie Thoracique et Cardiaque)', 'school': 'CAMES', 'period': '2011', 'description': 'Reçu Major.' },
          { 'degree': 'Praticien Hospitalier Attaché', 'school': 'Hôpital Pitié-Salpêtrière, Paris', 'period': '2005 - 2007', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Chirurgie', 'items': ['Chirurgie Cardiaque Interventielle', 'Management Hospitalier', 'Enseignement Universitaire'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'Expert' }],
        'interests': ['Opéra', 'Piano', 'Jardinage']
      }
    }
  },
  {
    'sector': 'Commerce & Vente',
    'levels': {
      'none': {
        'profile': { 'name': 'Jean-Luc Yao', 'title': 'Stagiaire Vendeur Conseil', 'email': 'jeanluc@example.com', 'phone': '+225 01 00 00 00', 'location': "Yamoussoukro, Côte d'Ivoire", 'photo': '' },
        'summary': 'Étudiant en commerce passionné par la relation client et les techniques de vente.',
        'experience': [
          { 'role': 'Vendeur (Saisonnier)', 'company': 'Supermarché Prosuma', 'period': '2023 (2 mois)', 'bullets': ['Accueil des clients, réapprovisionnement des rayons et encaissement.'] }
        ],
        'education': [
          { 'degree': 'BTS Commerce et Management', 'school': 'INP-HB', 'period': '2022 - Présent', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Vente', 'items': ['Accueil client', 'Gestion de caisse', 'Merchandising'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Natif' }]
      },
      'junior': {
        'profile': { 'name': 'Kouassi Kouamé', 'title': 'Commercial Terrain', 'email': 'kouassi@example.com', 'phone': '+225 05 11 22 33', 'location': "Abidjan, Côte d'Ivoire", 'photo': '' },
        'summary': "Commercial dynamique avec 2 ans d'expérience dans la prospection et la vente de solutions B2B.",
        'experience': [
          { 'role': 'Attaché Commercial', 'company': 'Distribution-CI', 'period': '2021 - Présent', 'bullets': ['Prospection de nouveaux clients et suivi du portefeuille existant.', 'Atteinte des objectifs mensuels à 110%.'] }
        ],
        'education': [
          { 'degree': 'Licence Professionnelle Vente', 'school': 'Pigier Abidjan', 'period': '2018 - 2021', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Soft Skills', 'items': ['Négociation', 'Persuasion', 'Gestion du stress'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Natif' }, { 'name': 'Baoulé', 'level': 'Courant' }]
      },
      'mid': {
        'profile': { 'name': 'Pierre Soglo', 'title': 'Responsable Commercial Régional', 'email': 'pierre@example.com', 'phone': '+229 96 00 11 22', 'location': 'Cotonou, Bénin', 'photo': '' },
        'summary': "Manager commercial avec 7 ans d'expertise dans le secteur de la grande distribution.",
        'experience': [
          { 'role': 'Chef de Secteur', 'company': 'Unilever Bénin', 'period': '2019 - Présent', 'bullets': ['Développement des ventes sur la zone Nord Bénin.', "Management d'une équipe de 5 promoteurs."] },
          { 'role': 'Délégué Commercial', 'company': 'CFAO Motors', 'period': '2016 - 2019', 'bullets': ['Vente de véhicules utilitaires aux entreprises.'] }
        ],
        'education': [
          { 'degree': 'Master en Management Commercial', 'school': 'GASA Formation', 'period': '2014 - 2016', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Management', 'items': ['Stratégie de vente', 'Analyse KPI', "Coaching d'équipe"] }] },
        'languages': [{ 'name': 'Français', 'level': 'Maternel' }, { 'name': 'Anglais', 'level': 'Professionnel' }]
      }
    }
  },
  {
    'sector': 'BTP & Ingénierie',
    'levels': {
      'junior': {
        'profile': { 'name': 'Moussa Touré', 'title': 'Conducteur de Travaux Junior', 'email': 'moussa@example.com', 'phone': '+223 70 00 11 22', 'location': 'Bamako, Mali', 'photo': '' },
        'summary': "Jeune ingénieur BTP passionné par le pilotage de chantiers et l'optimisation des ressources.",
        'experience': [
          { 'role': 'Aide Conducteur de Travaux', 'company': 'SOGEA-SATOM', 'period': '2022 - Présent', 'bullets': ["Suivi quotidien de l'avancement des travaux.", 'Gestion des approvisionnements en matériaux.'] },
          { 'role': 'Stagiaire Chantier', 'company': 'Ballo BTP', 'period': '2021', 'bullets': ['Lecture de plans et aide au traçage.'] }
        ],
        'education': [
          { 'degree': 'Ingénieur de Travaux BTP', 'school': 'ENI-ABT Bamako', 'period': '2018 - 2022', 'description': '' }
        ],
        'skills': { 'groups': [{ 'label': 'Technique', 'items': ['AutoCAD', 'MS Project', 'Lecture de plans'] }] },
        'languages': [{ 'name': 'Français', 'level': 'Natif' }, { 'name': 'Bambara', 'level': 'Natif' }]
      }
    }
  }
]