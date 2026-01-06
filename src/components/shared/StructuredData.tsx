import Script from 'next/script';

interface ProductStructuredDataProps {
  product: {
    name: string;
    description: string;
    price: number;
    currency: string;
    image: string;
    brand?: string;
    availability: 'in stock' | 'out of stock';
    sku: string;
    url: string;
  };
}

export function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand,
        }
      : undefined,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.currency,
      price: product.price,
      availability: `https://schema.org/${product.availability === 'in stock' ? 'InStock' : 'OutOfStock'}`,
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <Script
      id="product-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface OrganizationStructuredDataProps {
  name: string;
  url: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: {
    streetAddress?: string;
    addressLocality: string;
    addressCountry: string;
  };
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
  };
}

export function OrganizationStructuredData({
  name,
  url,
  logo,
  email,
  phone,
  address,
  socialMedia,
}: OrganizationStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    ...(logo && { logo }),
    ...(email && {
      contactPoint: {
        '@type': 'ContactPoint',
        email,
        contactType: 'customer service',
        ...(phone && { telephone: phone }),
      },
    }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        ...address,
      },
    }),
    ...(socialMedia && {
      sameAs: [
        ...(socialMedia.instagram ? [socialMedia.instagram] : []),
        ...(socialMedia.tiktok ? [socialMedia.tiktok] : []),
      ],
    }),
  };

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface WebsiteStructuredDataProps {
  name: string;
  url: string;
  description: string;
}

export function WebsiteStructuredData({ name, url, description }: WebsiteStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/busqueda-ia?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

