export type Persona = {
    id: string;
    sector: string;
    data: any;
}

export const PERSONAS: Persona[] = [
    {
        id: 'tech',
        sector: 'Informatique & Tech',
        data: {
            profile: { name: 'Jean Dupont', title: 'Développeur Full Stack', email: 'jean@example.com', phone: '+229 97 00 00 00', location: 'Cotonou, Bénin', photo: '' },
            summary: 'Développeur passionné avec 5 ans d\'expérience dans la création d\'applications web modernes.',
            experience: [{ title: 'Lead Developer', company: 'TechCorp', period: '2021 - Présent', description: 'Direction d\'une équipe de 5 développeurs.' }],
            education: [{ degree: 'Master Informatique', school: 'UAC', period: '2018 - 2020', description: 'Génie logiciel.' }],
            skills: { groups: [{ label: 'Frontend', items: ['React', 'Next.js', 'TypeScript'] }, { label: 'Backend', items: ['Node.js', 'FastAPI', 'PostgreSQL'] }] },
            languages: [{ name: 'Français', level: 'Maternel' }, { name: 'Anglais', level: 'C1' }]
        }
    },
    {
        id: 'marketing',
        sector: 'Marketing & Com',
        data: {
            profile: { name: 'Amina Koffi', title: 'Responsable Marketing Digital', email: 'amina@example.com', phone: '+229 96 11 22 33', location: 'Abidjan, Côte d\'Ivoire', photo: '' },
            summary: 'Spécialiste en marketing digital avec une expertise avérée dans la croissance de l\'audience et l\'engagement social.',
            experience: [{ title: 'Brand Manager', company: 'MediaGroup', period: '2019 - Présent', description: 'Gestion de l\'image de marque et des campagnes publicitaires.' }],
            education: [{ degree: 'MBA Marketing', school: 'ESCAE', period: '2016 - 2018', description: 'Marketing stratégique.' }],
            skills: { groups: [{ label: 'Marketing', items: ['SEO/SEA', 'Content Strategy', 'Social Media'] }, { label: 'Outils', items: ['Google Analytics', 'HubSpot', 'Canva'] }] },
            languages: [{ name: 'Français', level: 'Maternel' }, { name: 'Anglais', level: 'B2' }]
        }
    },
    {
        id: 'finance',
        sector: 'Finance & Gestion',
        data: {
            profile: { name: 'Marc Traoré', title: 'Analyste Financier', email: 'marc@example.com', phone: '+229 95 44 55 66', location: 'Bamako, Mali', photo: '' },
            summary: 'Expert en analyse financière et modélisation, dédié à l\'optimisation des performances économiques des entreprises.',
            experience: [{ title: 'Analyste Sénior', company: 'BankAfrica', period: '2018 - Présent', description: 'Analyse des risques et prévisions budgétaires.' }],
            education: [{ degree: 'Master en Finance', school: 'HEC', period: '2014 - 2016', description: 'Banque et Finance.' }],
            skills: { groups: [{ label: 'Finance', items: ['Modélisation', 'Audit', 'Gestion d\'actifs'] }, { label: 'Outils', items: ['Excel Expert', 'SAP', 'Bloomberg'] }] },
            languages: [{ name: 'Français', level: 'Maternel' }, { name: 'Anglais', level: 'C1' }]
        }
    },
    {
        id: 'sante',
        sector: 'Santé',
        data: {
            profile: { name: 'Sarah Lawson', title: 'Infirmière Spécialisée', email: 'sarah@example.com', phone: '+229 94 77 88 99', location: 'Lomé, Togo', photo: '' },
            summary: 'Infirmière passionnée par les soins intensifs, avec une approche centrée sur le bien-être du patient.',
            experience: [{ title: 'Infirmière Réanimateur', company: 'Hôpital Central', period: '2020 - Présent', description: 'Gestion des patients en état critique.' }],
            education: [{ degree: 'Diplôme d\'État d\'Infirmier', school: 'ENAM', period: '2016 - 2019', description: 'Soins infirmiers.' }],
            skills: { groups: [{ label: 'Médical', items: ['Premiers secours', 'Réanimation', 'Pharmacologie'] }, { label: 'Soft Skills', items: ['Empathie', 'Gestion du stress', 'Travail d\'équipe'] }] },
            languages: [{ name: 'Français', level: 'Maternel' }, { name: 'Anglais', level: 'A2' }]
        }
    }
];
