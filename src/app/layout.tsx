import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const jost = Jost({
	variable: "--font-jost",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Nike Store",
	description: "E-commerce website for Nike products",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
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
