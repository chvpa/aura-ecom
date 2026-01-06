import { HeroSearch } from '@/components/home/HeroSearch';
import { ValuePropositions } from '@/components/home/ValuePropositions';
import { CategoryCards } from '@/components/home/CategoryCards';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { OffersCarousel } from '@/components/home/OffersCarousel';
import { BrandsCarousel } from '@/components/home/BrandsCarousel';

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
