import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEOHead({
  title = 'UmukoziHR Resume Tailor - AI-Powered Resume & Cover Letter Generator',
  description = 'Generate perfectly tailored resumes and cover letters for any job with AI. ATS-optimized, region-specific formatting (US, EU, Global), and instant PDF downloads. Built for job seekers who want to stand out.',
  image = 'https://tailor.umukozihr.com/og-image.png',
  url = 'https://tailor.umukozihr.com',
  type = 'website'
}: SEOHeadProps) {
  const siteName = 'UmukoziHR Resume Tailor';
  const twitterHandle = '@UmukoziHR';

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content="resume builder, AI resume, cover letter generator, ATS optimization, job application, resume tailor, career tools, job search, professional resume, AI-powered resume, resume templates, cover letter templates, job hunting, resume optimization, applicant tracking system" />
      <meta name="author" content="UmukoziHR" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />

      {/* Generative Engine Optimization */}
      <meta name="ai-content-declaration" content="AI-assisted content generation tool" />
      <meta name="application-name" content="UmukoziHR Resume Tailor" />
      <meta name="apple-mobile-web-app-title" content="Resume Tailor" />

      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />

      {/* Theme Color */}
      <meta name="theme-color" content="#f97316" />
      <meta name="msapplication-TileColor" content="#f97316" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content="UmukoziHR Resume Tailor - AI Resume Generator" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:image:alt" content="UmukoziHR Resume Tailor" />
      <meta property="twitter:creator" content={twitterHandle} />
      <meta property="twitter:site" content={twitterHandle} />

      {/* LinkedIn */}
      <meta property="og:image:secure_url" content={image} />

      {/* Structured Data for Search Engines & AI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'UmukoziHR Resume Tailor',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            },
            description: description,
            url: url,
            image: image,
            author: {
              '@type': 'Organization',
              name: 'UmukoziHR',
              url: 'https://umukozihr.com'
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '127'
            },
            featureList: [
              'AI-powered resume generation',
              'ATS optimization',
              'Multi-region support (US, EU, Global)',
              'Cover letter generation',
              'PDF export',
              'LaTeX templates',
              'Real-time preview',
              'Keyword matching'
            ]
          })
        }}
      />

      {/* Favicons */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  );
}
