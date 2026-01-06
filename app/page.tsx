import { HeroSearch } from '@/components/home/HeroSearch';
import { ValuePropositions } from '@/components/home/ValuePropositions';
import { CategoryCards } from '@/components/home/CategoryCards';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { OffersCarousel } from '@/components/home/OffersCarousel';
import { BrandsCarousel } from '@/components/home/BrandsCarousel';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/utils/constants';

export const metadata: Metadata = {
  title: 'Inicio',
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'es_PY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function Home() {
  return (
    <div>
      <HeroSearch />
      <ValuePropositions />
      <CategoryCards />
      <FeaturedProducts />
      <OffersCarousel />
      <BrandsCarousel />
    </div>
  );
}
