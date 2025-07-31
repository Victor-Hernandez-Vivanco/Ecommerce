import type { NextConfig } from "next";

// ACÁ SE DEBE CONFIGURAR LA URL DE LA IMAGEN A MOSTRAR EN LA PUBLICIDAD DE LO CONTRARIO NEXT NO LA ACEPTARÁ

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.freepik.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "piwencl.vtexassets.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "productoslacena.com.ec",
        port: "",
        pathname: "/**",
      },
      // Agregar más dominios según necesites
    ],
  },
};

export default nextConfig;
