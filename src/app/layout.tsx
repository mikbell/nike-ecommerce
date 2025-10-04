import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { baseMetadata, generateOrganizationStructuredData, generateWebsiteStructuredData } from "@/lib/seo";

const jost = Jost({
	variable: "--font-jost",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Structured Data */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: generateOrganizationStructuredData(),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: generateWebsiteStructuredData(),
					}}
				/>
			</head>
			<body
				className={`${jost.variable} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="light">
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
