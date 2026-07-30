import { MetadataRoute } from "next";
import { getAllProperties } from "@/lib/properties";
import { getPropertySlug } from "@/lib/slug";

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://domosproperty.org";

  // Static core pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Fetch dynamic property listing pages
  const properties = await getAllProperties();
  const propertyPages: MetadataRoute.Sitemap = properties.map((property) => {
    const slug = getPropertySlug(property);
    return {
      url: `${baseUrl}/properties/${slug}`,
      lastModified: property.createdAt ? new Date(property.createdAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    };
  });

  return [...staticPages, ...propertyPages];
}
