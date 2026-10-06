import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME || 'Carriey'} - Votre hub professionnel central`,
  description: 'Centralisez votre parcours professionnel. Générez des CV, lettres de motivation et profils publics parfaitement adaptés à chaque opportunité.',
};

export default metadata;
